/**
 * â”€â”€â”€ Beat Routing Service (Newsroom Intelligence OS Phase 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *
 * Coordinates newsroom beat desks, routing signals to authorized beat editors
 * and reporters, managing alert fatigue metrics, and checking role-based IDOR.
 *
 * Governing document: NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md Â§4 (Beat
 * Taxonomy â€” permanently frozen at 16 beats), Â§9 (Routing Authority & IDOR),
 * Â§14 (Alert Fatigue), Â§21 (Persistence & Durability).
 *
 * The 16-beat taxonomy and the canonical recipient registry are the source of
 * truth here. Routing intelligence (entity/keyword rules and the overlap
 * resolution matrix) lives in this module; it is not a persisted schema.
 */

import {
  NewsroomSignal,
  NewsroomBeat,
  NewsroomBeatRecipient,
  BeatDeliveryTarget,
  NewsroomEscalationRecord,
  Phase2Authorization,
} from '@/types/newsroom-intelligence';
import { NewsroomAuditService } from './audit-service';
import { isDemoMode } from '@/features/auth/demo';
import {
  BeatFatigueSnapshot,
  NewsroomFatigueTelemetry,
  UserFatigueSnapshot,
  emptyBeatFatigue,
  emptyUserFatigue,
} from './persistence/state';

/**
 * Alert fatigue policy caps (Operating Standard Â§14 â€” Alert Fatigue).
 * Enforced at delivery time against rolling timestamps.
 */
export const NEWSROOM_FATIGUE_LIMITS = {
  maxAlertsPerHour: 3,
  maxAlertsPerDay: 15,
  maxAlertsPerBeatPerDay: 5,
} as const;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Word-boundary keyword match. Short keywords such as 'ai', 'mp', 'pm', '5g'
 * must never match as substrings inside unrelated words ('said', 'company').
 */
function containsKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(text);
}

interface BeatRule {
  id: string;
  name: string;
  domains: string[];
  entities: string[];
  keywords: string[];
}

/**
 * Frozen 16-beat taxonomy (Operating Standard Â§4). Do not add beats.
 */
const BEAT_RULES: BeatRule[] = [
  {
    id: 'economy',
    name: 'Economy & Finance',
    domains: ['economy', 'finance', 'banking', 'markets', 'trade', 'budget', 'monetary_policy'],
    entities: ['rbi', 'sebi', 'mof', 'ministry of finance', 'finance ministry', 'central bank', 'ecb', 'nirmala sitharaman'],
    keywords: ['repo rate', 'inflation', 'gdp', 'fiscal', 'budget', 'monetary policy', 'gst', 'forex', 'currency', 'interest rate', 'securities'],
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Rural',
    domains: ['agriculture', 'crop', 'mgnrega', 'rural', 'farming'],
    entities: ['ministry of agriculture', 'fci', 'cacp', 'mgnrega', 'fasal bima'],
    keywords: ['msp', 'crop', 'rural', 'farmer', 'ethanol', 'monsoon', 'kharif', 'rabi', 'fertilizer', 'irrigation', 'agriculture'],
  },
  {
    id: 'judiciary',
    name: 'Judiciary & Law',
    domains: ['judiciary', 'courts', 'law', 'constitution'],
    entities: ['supreme court', 'high court', 'cji', 'judiciary', 'law ministry'],
    keywords: ['verdict', 'judgment', 'bench', 'constitution bench', 'contempt', 'habeas', 'appeal', 'lawsuit', 'court hearing'],
  },
  {
    id: 'politics',
    name: 'Politics & Elections',
    domains: ['politics', 'elections', 'parliament', 'governance'],
    entities: ['eci', 'election commission', 'parliament', 'lok sabha', 'rajya sabha', 'political party', 'pm'],
    keywords: ['election', 'constituency', 'voting', 'bill', 'legislation', 'poll', 'mp', 'mla'],
  },
  {
    id: 'defence',
    name: 'Defence & Security',
    domains: ['defence', 'security', 'national_security', 'military'],
    entities: ['mod', 'ministry of defence', 'ccs', 'army', 'navy', 'air force', 'nsa', 'drdo', 'bsf', 'itbp'],
    keywords: ['border', 'lac', 'loc', 'military', 'defence', 'exercise', 'indo-pak', 'strategic', 'national security'],
  },
  {
    id: 'technology',
    name: 'Technology & Digital',
    domains: ['technology', 'digital', 'ai', 'cybersecurity', 'software'],
    entities: ['meity', 'cert-in', 'dot', 'digilocker', 'umang'],
    keywords: ['ai', 'software', 'chip', 'fab', 'semiconductor', 'cybersecurity', 'data breach', 'app', 'digital'],
  },
  {
    id: 'health',
    name: 'Health & ICMR',
    domains: ['health', 'medical', 'medicine', 'pharma'],
    entities: ['mohfw', 'icmr', 'cdsco', 'ncdc', 'who'],
    keywords: ['pandemic', 'vaccine', 'drug approval', 'virus', 'disease', 'hospital', 'advisory', 'clinical trial'],
  },
  {
    id: 'education',
    name: 'Education & Academia',
    domains: ['education', 'academia', 'schooling'],
    entities: ['ministry of education', 'ugc', 'cbse', 'ncert'],
    keywords: ['board exam', 'ugc rules', 'curriculum', 'university', 'school', 'college', 'admission'],
  },
  {
    id: 'foreign_affairs',
    name: 'Foreign Affairs & Diplomacy',
    domains: ['foreign_affairs', 'diplomacy', 'international_relations'],
    entities: ['mea', 'ministry of external affairs', 'united nations', 'un', 'embassy'],
    keywords: ['state visit', 'diplomat', 'sanction', 'treaty', 'bilateral', 'summit', 'un vote', 'consular'],
  },
  {
    id: 'climate',
    name: 'Climate & Environment',
    domains: ['climate', 'environment', 'weather', 'disaster_management'],
    entities: ['moefcc', 'imd', 'cpcb', 'ipcc', 'moes'],
    keywords: ['weather warning', 'cyclone', 'flood', 'heatwave', 'air quality', 'emission', 'climate', 'monsoon warning'],
  },
  {
    id: 'telecom',
    name: 'Telecom & Broadcasting',
    domains: ['telecom', 'broadcasting', 'telephony'],
    entities: ['trai', 'dot', 'bsnl', 'jio', 'airtel', 'vi'],
    keywords: ['spectrum', 'tariff', 'tower', 'licensing', '5g', 'telecom'],
  },
  {
    id: 'labour',
    name: 'Labour & Employment',
    domains: ['labour', 'employment', 'wages'],
    entities: ['mole', 'ministry of labour', 'epfo', 'esic', 'trade union'],
    keywords: ['minimum wage', 'epfo rate', 'labor code', 'labour code', 'gig welfare', 'layoff', 'wage'],
  },
  {
    id: 'science',
    name: 'Science & Space',
    domains: ['science', 'space', 'research'],
    entities: ['csir', 'isro', 'dst', 'institute'],
    keywords: ['space launch', 'research paper', 'study', 'breakthrough', 'telescope', 'satellite'],
  },
  {
    id: 'business',
    name: 'Business & Markets',
    domains: ['business', 'corporate', 'capital_markets', 'industry'],
    entities: ['mca', 'sebi', 'nclt', 'ministry of corporate affairs', 'irdai'],
    keywords: ['merger', 'acquisition', 'insolvency', 'audit', 'listing', 'ipo', 'corporate'],
  },
  {
    id: 'consumer',
    name: 'Consumer Affairs',
    domains: ['consumer', 'consumer_protection'],
    entities: ['ccpa', 'ministry of consumer affairs', 'nch'],
    keywords: ['recall', 'false advertising', 'consumer complaint', 'product safety', 'labelling', 'penalty'],
  },
  {
    id: 'transport',
    name: 'Transport & Infrastructure',
    domains: ['transport', 'infrastructure', 'aviation', 'railways'],
    entities: ['dgca', 'railway board', 'morth', 'air india', 'ports'],
    keywords: ['aviation', 'railway', 'toll', 'flight', 'crash', 'derailment', 'port'],
  },
];

/**
 * Flattened canonical entity lexicon (Operating Standard §4).
 * Reused by source adapters so entity extraction never diverges from the
 * frozen taxonomy. No duplication of the taxonomy outside this module.
 */
export function getCanonicalEntityLexicon(): string[] {
  const seen = new Set<string>();
  for (const rule of BEAT_RULES) {
    for (const entity of rule.entities) seen.add(entity);
  }
  return Array.from(seen);
}

interface OverlapRule {
  a: string;
  b: string;
  /** When both beats match, returns whether `a` is kept (true) or `b` (false). */
  keepA: (lowerEntities: string[], lowerText: string) => boolean;
}

/**
 * Deterministic overlap resolution for signals that match multiple beats.
 * This prevents dual-delivery of the same signal to sibling beats and keeps
 * routing authoritative rather than ambiguous.
 */
const OVERLAP_RULES: OverlapRule[] = [
  {
    a: 'economy',
    b: 'business',
    keepA: (entities, text) =>
      entities.some((e) => ['rbi', 'mof', 'ministry of finance', 'finance ministry', 'central bank', 'ecb', 'nirmala sitharaman'].includes(e)) ||
      ['repo rate', 'inflation', 'gdp', 'fiscal', 'budget', 'monetary', 'gst', 'forex', 'currency', 'interest rate', 'securities'].some((k) => containsKeyword(text, k)),
  },
  {
    a: 'science',
    b: 'technology',
    keepA: (entities, text) =>
      !entities.some((e) => ['meity', 'cert-in', 'dot'].includes(e)) &&
      !['ai', 'software', 'semiconductor', 'cybersecurity', 'data breach', 'chip', 'fab', 'digital', 'app'].some((k) => containsKeyword(text, k)),
  },
  {
    a: 'technology',
    b: 'telecom',
    keepA: (entities, text) =>
      !entities.some((e) => ['trai', 'bsnl', 'jio', 'airtel', 'vi'].includes(e)) &&
      !['spectrum', 'tariff', 'telecom', '5g', 'tower', 'licensing'].some((k) => containsKeyword(text, k)),
  },
  {
    a: 'consumer',
    b: 'business',
    keepA: (entities, text) =>
      entities.some((e) => ['ccpa', 'ministry of consumer affairs', 'nch'].includes(e)) ||
      ['recall', 'false advertising', 'consumer complaint', 'product safety', 'labelling'].some((k) => containsKeyword(text, k)),
  },
  {
    a: 'health',
    b: 'consumer',
    keepA: (entities, text) =>
      entities.some((e) => ['mohfw', 'icmr', 'cdsco', 'ncdc', 'who'].includes(e)) ||
      ['vaccine', 'clinical trial', 'hospital', 'drug approval', 'pandemic', 'virus', 'disease', 'advisory'].some((k) => containsKeyword(text, k)),
  },
  {
    a: 'transport',
    b: 'climate',
    keepA: (entities, text) =>
      !entities.some((e) => ['moefcc', 'imd', 'cpcb', 'ipcc', 'moes'].includes(e)) &&
      !['weather warning', 'cyclone', 'flood', 'heatwave', 'air quality', 'emission', 'climate', 'monsoon warning'].some((k) => containsKeyword(text, k)),
  },
  {
    a: 'foreign_affairs',
    b: 'defence',
    keepA: (entities, text) =>
      !entities.some((e) => ['mod', 'ministry of defence', 'ccs', 'army', 'navy', 'air force', 'nsa', 'drdo', 'bsf', 'itbp'].includes(e)) &&
      !['border', 'lac', 'loc', 'military', 'defence', 'exercise', 'indo-pak', 'strategic', 'national security'].some((k) => containsKeyword(text, k)),
  },
  {
    a: 'judiciary',
    b: 'politics',
    keepA: (entities, text) =>
      entities.some((e) => ['supreme court', 'high court', 'cji', 'judiciary', 'law ministry'].includes(e)) ||
      ['verdict', 'judgment', 'bench', 'constitution bench', 'contempt', 'habeas', 'appeal', 'lawsuit', 'court hearing'].some((k) => containsKeyword(text, k)),
  },
];

export class BeatRoutingService {
  private static instance: BeatRoutingService | null = null;

  private authorization: Phase2Authorization | null = null;
  private beats: Map<string, NewsroomBeat> = new Map();
  private recipients: Map<string, NewsroomBeatRecipient> = new Map();
  private escalations: NewsroomEscalationRecord[] = [];

  // Telemetry for Fatigue Tracking
  private userFatigue: Map<string, UserFatigueSnapshot> = new Map();
  private beatFatigue: Map<string, BeatFatigueSnapshot> = new Map();

  private constructor() {
    this.initializeDefaultBeats();
    this.initializeDefaultRecipients();
  }

  public static getInstance(): BeatRoutingService {
    if (!BeatRoutingService.instance) {
      BeatRoutingService.instance = new BeatRoutingService();
    }
    return BeatRoutingService.instance;
  }

  private initializeDefaultBeats() {
    this.beats.clear();
    for (const rule of BEAT_RULES) {
      this.beats.set(rule.id, {
        id: rule.id,
        name: rule.name,
        domains: rule.domains,
        active: true,
      });
    }
  }

  private initializeDefaultRecipients() {
    this.recipients.clear();

    const recipients: NewsroomBeatRecipient[] = [
      { userId: 'reporter-01', role: 'reporter', beatIds: ['economy', 'agriculture'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      { userId: 'reporter-02', role: 'reporter', beatIds: ['politics', 'judiciary'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      { userId: 'reporter-03', role: 'reporter', beatIds: ['defence', 'technology'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      { userId: 'reporter-04', role: 'reporter', beatIds: ['health', 'education'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      { userId: 'reporter-05', role: 'reporter', beatIds: ['foreign_affairs', 'climate'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      { userId: 'reporter-06', role: 'reporter', beatIds: ['telecom', 'labour'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      { userId: 'reporter-07', role: 'reporter', beatIds: ['science', 'business'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      { userId: 'reporter-08', role: 'reporter', beatIds: ['consumer', 'transport'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      {
        userId: 'editor-01',
        role: 'editor',
        beatIds: BEAT_RULES.map((b) => b.id),
        active: true,
        notificationPreference: 'immediate',
        escalationLevel: 2,
      },
      {
        userId: 'managing-editor-01',
        role: 'managing_editor',
        beatIds: BEAT_RULES.map((b) => b.id),
        active: true,
        notificationPreference: 'immediate',
        escalationLevel: 3,
      },
    ];

    // In demo mode (no Supabase configured, non-production) the client-only
    // demo session impersonates a global beat editor, so it must be
    // provisioned in the recipient registry to pass access checks.
    if (isDemoMode()) {
      recipients.push({
        userId: 'demo-editor',
        role: 'editor',
        beatIds: BEAT_RULES.map((b) => b.id),
        active: true,
        notificationPreference: 'immediate',
        escalationLevel: 2,
      });
    }

    for (const r of recipients) {
      this.recipients.set(r.userId, r);
    }
  }

  // â”€â”€ Authorization Gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public authorizePhase2(auth: Phase2Authorization): void {
    this.authorization = { ...auth };
    NewsroomAuditService.logAction({
      signalId: 'system',
      actorId: auth.authorizedBy,
      actorName: 'System Administrator',
      action: 'SYSTEM_STATE_TRANSITION',
      reason: `Phase 2 authorized by ${auth.authorizedBy} (${auth.authorizedRole})`,
      metadata: { auth },
    });
  }

  public deauthorizePhase2(): void {
    this.authorization = null;
    NewsroomAuditService.logAction({
      signalId: 'system',
      actorId: 'admin',
      actorName: 'System Administrator',
      action: 'SYSTEM_STATE_TRANSITION',
      reason: 'Phase 2 deauthorized. Rolled back to Phase 1 restricted internal alerting.',
    });
  }

  public getAuthorization(): Phase2Authorization | null {
    return this.authorization;
  }

  public isPhase2Active(): boolean {
    return this.authorization !== null;
  }

  // â”€â”€ Beat Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public setBeatStatus(beatId: string, active: boolean): void {
    const beat = this.beats.get(beatId);
    if (beat) {
      beat.active = active;
      NewsroomAuditService.logAction({
        signalId: 'system',
        actorId: 'admin',
        actorName: 'System Administrator',
        action: 'SYSTEM_STATE_TRANSITION',
        reason: `Beat ${beatId} status updated: active=${active ? 'true' : 'false'}`,
      });
    }
  }

  public isBeatActive(beatId: string): boolean {
    return this.beats.get(beatId)?.active ?? false;
  }

  public getBeats(): NewsroomBeat[] {
    return Array.from(this.beats.values());
  }

  public registerRecipient(recipient: NewsroomBeatRecipient): void {
    this.recipients.set(recipient.userId, recipient);
  }

  public getRecipient(userId: string): NewsroomBeatRecipient | undefined {
    return this.recipients.get(userId);
  }

  public getRecipients(): NewsroomBeatRecipient[] {
    return Array.from(this.recipients.values());
  }

  // â”€â”€ Routing Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Deterministically maps a canonical Signal to matched beats using the
   * frozen entity/keyword rules, then resolves overlaps via the matrix above.
   * Signals matching no beat return [] â€” no routing occurs until a beat is
   * identifiable (a deliberate fail-safe, not a 'general' bucket).
   */
  public determineSignalBeats(signal: NewsroomSignal): string[] {
    const lowerEntities = signal.keyEntities.map((e) => e.toLowerCase());
    const text = `${signal.title} ${signal.summary} ${signal.explanation.whyItMatters}`.toLowerCase();

    const matched = new Set<string>();
    for (const rule of BEAT_RULES) {
      const entityHit = lowerEntities.some((e) => rule.entities.includes(e));
      const keywordHit = rule.keywords.some((k) => containsKeyword(text, k));
      if (entityHit || keywordHit) {
        matched.add(rule.id);
      }
    }

    for (const { a, b, keepA } of OVERLAP_RULES) {
      if (matched.has(a) && matched.has(b)) {
        if (keepA(lowerEntities, text)) {
          matched.delete(b);
        } else {
          matched.delete(a);
        }
      }
    }

    return Array.from(matched);
  }

  /**
   * Routes a logical alert to specific beat delivery targets.
   * Enforces deduplication per recipient and the alert fatigue caps
   * (Operating Standard Â§14): 3/hr and 15/day per recipient, 5/day per beat.
   */
  public routeAlert(signal: NewsroomSignal, alertId: string, now: Date = new Date()): BeatDeliveryTarget[] {
    const matchedBeats = this.determineSignalBeats(signal);
    const deliveries: BeatDeliveryTarget[] = [];
    const processedRecipients = new Set<string>();
    const nowMs = now.getTime();

    for (const beatId of matchedBeats) {
      // Check if beat dispatch is active (kill switch/disable check)
      if (!this.isBeatActive(beatId)) continue;

      const beatFatigue = this.ensureBeatFatigue(beatId);
      // Beat cap: at most 5 P0/P1 alerts per day to a single beat.
      const beatDayDeliveries = beatFatigue.deliveredAt.filter((t) => nowMs - Date.parse(t) < DAY_MS).length;
      if (beatDayDeliveries >= NEWSROOM_FATIGUE_LIMITS.maxAlertsPerBeatPerDay) {
        beatFatigue.suppressedAlerts += 1;
        continue;
      }

      const beatRecipients = Array.from(this.recipients.values()).filter(
        (r) => r.active && r.beatIds.includes(beatId)
      );

      let beatDelivered = false;

      for (const recipient of beatRecipients) {
        if (processedRecipients.has(recipient.userId)) {
          // Recipient already mapped from a previous overlapping beat
          this.recordUserDuplicateSuppression(recipient.userId);
          continue;
        }

        // Recipient fatigue caps apply to P0/P1 alerts.
        if (signal.priority === 'P0' || signal.priority === 'P1') {
          const userFatigue = this.ensureUserFatigue(recipient.userId);
          const hourDeliveries = userFatigue.deliveredAt.filter((t) => nowMs - Date.parse(t) < HOUR_MS).length;
          const dayDeliveries = userFatigue.deliveredAt.filter((t) => nowMs - Date.parse(t) < DAY_MS).length;
          if (
            hourDeliveries >= NEWSROOM_FATIGUE_LIMITS.maxAlertsPerHour ||
            dayDeliveries >= NEWSROOM_FATIGUE_LIMITS.maxAlertsPerDay
          ) {
            userFatigue.fatigueSuppressed += 1;
            continue;
          }
        }

        deliveries.push({
          recipientId: recipient.userId,
          recipientRole: recipient.role,
          beatId,
          deliveryStatus: 'delivered',
          routingReason: `Signal mapped to beat: ${beatId} (priority ${signal.priority})`,
          deliveredAt: now.toISOString(),
        });

        processedRecipients.add(recipient.userId);
        this.trackUserAlertFatigue(recipient.userId, signal.priority, now);
        beatDelivered = true;
      }

      if (beatDelivered) {
        this.trackBeatAlertVolume(beatId, now);
      }
    }

    return deliveries;
  }

  // â”€â”€ Escalation Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public recordEscalation(record: NewsroomEscalationRecord): void {
    this.escalations.push(record);
    NewsroomAuditService.logAction({
      signalId: record.signalId,
      actorId: record.actor,
      actorName: record.actor,
      action: 'ESCALATE',
      previousState: 'assigned',
      newState: 'escalated',
      reason: `Escalated: ${record.reason}. Previous Owner: ${record.previousOwner || 'none'} -> New Owner: ${record.newOwner}`,
      metadata: { ...record },
    });
  }

  public getEscalations(signalId?: string): NewsroomEscalationRecord[] {
    if (signalId) {
      return this.escalations.filter((e) => e.signalId === signalId);
    }
    return [...this.escalations];
  }

  // â”€â”€ Access Control (IDOR Mitigation) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Enforces reporter & editor beat security checks.
   * Returns true if authorized, false otherwise.
   */
  public checkUserAccess(
    user: { id: string; role: string },
    signal: NewsroomSignal
  ): boolean {
    const role = user.role.toLowerCase();

    // Managing Editors, Fact Checkers, and Owners have global visibility
    if (role === 'managing_editor' || role === 'fact_checker' || role === 'owner') {
      return true;
    }

    // Guests have no access to newsroom signals
    if (role === 'guest') {
      return false;
    }

    // Reporters and Beat Editors must be assigned to at least one of the signal's beats
    const recipient = this.recipients.get(user.id);
    if (!recipient || !recipient.active) {
      return false;
    }

    const signalBeats = this.determineSignalBeats(signal);
    return signalBeats.some((b) => recipient.beatIds.includes(b));
  }

  // â”€â”€ Telemetry & Fatigue Tracking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private ensureUserFatigue(userId: string): UserFatigueSnapshot {
    let fatigue = this.userFatigue.get(userId);
    if (!fatigue) {
      fatigue = emptyUserFatigue();
      this.userFatigue.set(userId, fatigue);
    }
    return fatigue;
  }

  private ensureBeatFatigue(beatId: string): BeatFatigueSnapshot {
    let fatigue = this.beatFatigue.get(beatId);
    if (!fatigue) {
      fatigue = emptyBeatFatigue();
      this.beatFatigue.set(beatId, fatigue);
    }
    return fatigue;
  }

  private trackUserAlertFatigue(userId: string, priority: string, now: Date = new Date()) {
    const fatigue = this.ensureUserFatigue(userId);
    fatigue.alertsToday += 1;
    fatigue.deliveredAt.push(now.toISOString());
    if (priority === 'P0') fatigue.p0Count += 1;
    if (priority === 'P1') fatigue.p1Count += 1;
  }

  private recordUserDuplicateSuppression(userId: string) {
    const fatigue = this.ensureUserFatigue(userId);
    fatigue.duplicatesSkipped += 1;
  }

  public recordUserAlertAction(userId: string, actionType: string) {
    const fatigue = this.userFatigue.get(userId);
    if (!fatigue) return;

    if (actionType === 'ALERT_ACK') {
      fatigue.acknowledgements += 1;
    } else if (actionType === 'IGNORE') {
      fatigue.ignores += 1;
    } else {
      fatigue.actions += 1;
    }
  }

  private trackBeatAlertVolume(beatId: string, now: Date = new Date()) {
    const fatigue = this.ensureBeatFatigue(beatId);
    fatigue.alertVolume += 1;
    fatigue.deliveredAt.push(now.toISOString());
  }

  public trackBeatSignal(beatId: string) {
    const fatigue = this.ensureBeatFatigue(beatId);
    fatigue.signalVolume += 1;
  }

  public recordBeatFalseAlert(beatId: string) {
    const fatigue = this.ensureBeatFatigue(beatId);
    fatigue.falseAlerts += 1;
  }

  public getUserFatigueMetrics(userId: string): UserFatigueSnapshot {
    const fatigue = this.userFatigue.get(userId);
    if (!fatigue) return emptyUserFatigue();
    const nowMs = Date.now();
    return {
      ...fatigue,
      alertsPerHour: fatigue.deliveredAt.filter((t) => nowMs - Date.parse(t) < HOUR_MS).length,
    };
  }

  public getBeatFatigueMetrics(beatId: string): BeatFatigueSnapshot {
    const fatigue = this.beatFatigue.get(beatId);
    return fatigue ? { ...fatigue } : emptyBeatFatigue();
  }

  // â”€â”€ Persistence (Operating Standard Â§21) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public snapshot(): {
    beats: NewsroomBeat[];
    recipients: NewsroomBeatRecipient[];
    authorization: Phase2Authorization | null;
    escalations: NewsroomEscalationRecord[];
    fatigue: NewsroomFatigueTelemetry;
  } {
    return {
      beats: Array.from(this.beats.values()),
      recipients: Array.from(this.recipients.values()),
      authorization: this.authorization,
      escalations: [...this.escalations],
      fatigue: {
        userFatigue: Object.fromEntries(this.userFatigue),
        beatFatigue: Object.fromEntries(this.beatFatigue),
      },
    };
  }

  public restore(state: {
    beats: NewsroomBeat[];
    recipients: NewsroomBeatRecipient[];
    authorization: Phase2Authorization | null;
    escalations: NewsroomEscalationRecord[];
    fatigue: NewsroomFatigueTelemetry;
  }): void {
    this.beats.clear();
    for (const b of state.beats) this.beats.set(b.id, b);
    this.recipients.clear();
    for (const r of state.recipients) this.recipients.set(r.userId, r);
    this.authorization = state.authorization;
    this.escalations = [...state.escalations];
    this.userFatigue.clear();
    for (const [k, v] of Object.entries(state.fatigue.userFatigue)) this.userFatigue.set(k, v);
    this.beatFatigue.clear();
    for (const [k, v] of Object.entries(state.fatigue.beatFatigue)) this.beatFatigue.set(k, v);
  }

  public clear(): void {
    this.authorization = null;
    this.escalations = [];
    this.userFatigue.clear();
    this.beatFatigue.clear();
    this.initializeDefaultBeats();
    this.initializeDefaultRecipients();
  }
}

export const beatRoutingService = BeatRoutingService.getInstance();
