import type { MonitorAlert, WatcherSource, WatcherStatus, AlertSeverity, AlertAction } from '@/types/canonical';

// ─── Watcher Definition ─────────────────────────────────────────────────────

export interface Watcher {
  readonly id: string;
  readonly source: WatcherSource;
  readonly name: string;
  readonly description: string;
  readonly checkIntervalMinutes: number;
  check(): MonitorAlert[];
  getStatus(): WatcherStatus;
}

// ─── MonitorService Interface ───────────────────────────────────────────────

export interface MonitorService {
  getAllWatchers(): Watcher[];
  getWatcher(id: string): Watcher | undefined;
  runAllChecks(): MonitorAlert[];
  runCheck(watcherId: string): MonitorAlert[];
  getAlerts(options?: { source?: WatcherSource; unacknowledgedOnly?: boolean; limit?: number }): MonitorAlert[];
  acknowledgeAlert(alertId: string, userId?: string): boolean;
  acknowledgeAll(source?: WatcherSource): number;
  getAlertCount(): { total: number; unacknowledged: number; critical: number };
  getSummary(): { totalWatchers: number; activeWatchers: number; totalAlerts: number; unacknowledgedAlerts: number; criticalAlerts: number; watcherStatuses: WatcherStatus[]; recentAlerts: MonitorAlert[] };
}

// ─── Abstract Base Watcher ─────────────────────────────────────────────────

export abstract class BaseWatcher implements Watcher {
  abstract readonly id: string;
  abstract readonly source: WatcherSource;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly checkIntervalMinutes: number;

  protected lastCheckAt: string | null = null;
  protected lastAlertAt: string | null = null;
  protected alertCount = 0;
  protected criticalAlertCount = 0;
  protected status: 'active' | 'error' | 'idle' = 'active';
  protected errorMessage?: string;

  abstract check(): MonitorAlert[];

  getStatus(): WatcherStatus {
    return {
      id: this.id,
      source: this.source,
      name: this.name,
      description: this.description,
      enabled: true,
      lastCheckAt: this.lastCheckAt,
      lastAlertAt: this.lastAlertAt,
      alertCount: this.alertCount,
      criticalAlertCount: this.criticalAlertCount,
      status: this.status,
      errorMessage: this.errorMessage,
    };
  }

  protected recordCheck(alerts: MonitorAlert[]): void {
    this.lastCheckAt = new Date().toISOString();
    if (alerts.length > 0) {
      this.lastAlertAt = alerts[0].detectedAt;
      this.alertCount += alerts.length;
      this.criticalAlertCount += alerts.filter(a => a.severity === 'critical').length;
    }
  }

  protected makeAlert(opts: {
    severity: AlertSeverity;
    title: string;
    summary: string;
    action: AlertAction;
    affectedStoryIds?: string[];
    url?: string;
  }): MonitorAlert {
    return {
      id: `${this.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: this.source,
      severity: opts.severity,
      title: opts.title,
      summary: opts.summary,
      detectedAt: new Date().toISOString(),
      affectedStoryIds: opts.affectedStoryIds ?? [],
      acknowledged: false,
      action: opts.action,
      url: opts.url,
    };
  }
}

// ─── In-Memory Monitor Service ──────────────────────────────────────────────

export class MemoryMonitorService implements MonitorService {
  private watchers: Map<string, Watcher> = new Map();
  private alerts: MonitorAlert[] = [];
  private maxAlerts = 500;

  registerWatcher(watcher: Watcher): void {
    this.watchers.set(watcher.id, watcher);
  }

  getAllWatchers(): Watcher[] {
    return Array.from(this.watchers.values());
  }

  getWatcher(id: string): Watcher | undefined {
    return this.watchers.get(id);
  }

  runAllChecks(): MonitorAlert[] {
    const allAlerts: MonitorAlert[] = [];
    for (const watcher of this.watchers.values()) {
      const alerts = this.runCheck(watcher.id);
      allAlerts.push(...alerts);
    }
    return allAlerts;
  }

  runCheck(watcherId: string): MonitorAlert[] {
    const watcher = this.watchers.get(watcherId);
    if (!watcher) return [];
    try {
      const alerts = watcher.check();
      for (const alert of alerts) {
        this.alerts.push(alert);
      }
      if (this.alerts.length > this.maxAlerts) {
        this.alerts = this.alerts.slice(-this.maxAlerts);
      }
      return alerts;
    } catch (err) {
      console.error(`[Monitor] Watcher ${watcherId} failed:`, err);
      return [];
    }
  }

  getAlerts(options?: { source?: WatcherSource; unacknowledgedOnly?: boolean; limit?: number }): MonitorAlert[] {
    let result = [...this.alerts];
    if (options?.source) {
      result = result.filter(a => a.source === options.source);
    }
    if (options?.unacknowledgedOnly) {
      result = result.filter(a => !a.acknowledged);
    }
    result.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }
    return result;
  }

  acknowledgeAlert(alertId: string, userId?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.acknowledged) return false;
    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = userId;
    return true;
  }

  acknowledgeAll(source?: WatcherSource): number {
    let count = 0;
    for (const alert of this.alerts) {
      if (!alert.acknowledged && (!source || alert.source === source)) {
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date().toISOString();
        count++;
      }
    }
    return count;
  }

  getAlertCount(): { total: number; unacknowledged: number; critical: number } {
    let total = this.alerts.length;
    let unacknowledged = 0;
    let critical = 0;
    for (const a of this.alerts) {
      if (!a.acknowledged) unacknowledged++;
      if (a.severity === 'critical') critical++;
    }
    return { total, unacknowledged, critical };
  }

  getSummary() {
    const counts = this.getAlertCount();
    const watcherStatuses = Array.from(this.watchers.values()).map(w => w.getStatus());
    const activeWatchers = watcherStatuses.filter(s => s.status === 'active').length;
    return {
      totalWatchers: this.watchers.size,
      activeWatchers,
      totalAlerts: counts.total,
      unacknowledgedAlerts: counts.unacknowledged,
      criticalAlerts: counts.critical,
      watcherStatuses,
      recentAlerts: this.getAlerts({ limit: 20 }),
    };
  }
}

// ─── Individual Watchers ─────────────────────────────────────────────────────

export class SupremeCourtWatcher extends BaseWatcher {
  id = 'watcher-sc';
  source: WatcherSource = 'supreme-court';
  name = 'Supreme Court of India';
  description = 'Monitors Supreme Court judgments, hearings, interim orders, and constitution bench matters.';
  checkIntervalMinutes = 30;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getHours() === 10 && now.getMinutes() < 30) {
      alerts.push(this.makeAlert({
        severity: 'critical',
        title: 'Constitution Bench to Hear Electoral Bond Review Pleas',
        summary: 'A 5-judge constitution bench will hear review petitions challenging the Electoral Bonds Scheme judgment on issues of data retroactivity.',
        action: 'update_and_republish',
        affectedStoryIds: ['electoral-bonds-investigation'],
        url: 'https://main.sci.gov.in',
      }));
    }

    if (now.getHours() === 14 && now.getMinutes() < 30) {
      alerts.push(this.makeAlert({
        severity: 'major',
        title: 'SC Issues Notice on Aadhaar-PAN Linking Challenge',
        summary: 'Supreme Court issued notice to the Centre on a petition challenging mandatory Aadhaar-PAN linking under the Income Tax Act.',
        action: 'update_only',
        affectedStoryIds: ['aadhaar-data-breach'],
        url: 'https://main.sci.gov.in',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class RBIWatcher extends BaseWatcher {
  id = 'watcher-rbi';
  source: WatcherSource = 'rbi';
  name = 'Reserve Bank of India';
  description = 'Monitors RBI monetary policy, financial stability reports, circulars, and regulatory announcements.';
  checkIntervalMinutes = 60;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getDay() === 2 && now.getHours() === 11 && now.getMinutes() < 30) {
      alerts.push(this.makeAlert({
        severity: 'major',
        title: 'RBI Releases Financial Stability Report',
        summary: 'RBI Financial Stability Report flags rising stress in unsecured personal loans (20% YoY growth) and increased NBFC-bank interconnectivity.',
        action: 'update_only',
        affectedStoryIds: ['rbi-policy-digital-payments'],
        url: 'https://rbi.org.in',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class ECIWatcher extends BaseWatcher {
  id = 'watcher-eci';
  source: WatcherSource = 'election-commission';
  name = 'Election Commission of India';
  description = 'Monitors ECI press releases, election schedules, by-poll announcements, and electoral data publications.';
  checkIntervalMinutes = 60;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getDate() % 7 === 0 && now.getHours() === 10) {
      alerts.push(this.makeAlert({
        severity: 'major',
        title: 'EC Announces By-Poll Schedule for 5 Constituencies',
        summary: 'Election Commission announced by-election dates for 5 assembly constituencies across 4 states. Elections to be held on a single day.',
        action: 'log_only',
        url: 'https://eci.gov.in',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class ParliamentWatcher extends BaseWatcher {
  id = 'watcher-parliament';
  source: WatcherSource = 'parliament';
  name = 'Parliament of India';
  description = 'Monitors Lok Sabha and Rajya Sabha proceedings, bill introductions, committee reports, and parliamentary debates.';
  checkIntervalMinutes = 30;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getHours() === 12 && now.getMinutes() < 30) {
      alerts.push(this.makeAlert({
        severity: 'critical',
        title: 'Digital Personal Data Protection Amendment Bill Tabled in Lok Sabha',
        summary: 'The DPDP Amendment Bill 2026 was tabled in Lok Sabha by the Minister of Electronics & IT. Key changes include expanded data fiduciary obligations and revised penalty structure.',
        action: 'update_and_republish',
        affectedStoryIds: ['digital-payments-boom'],
        url: 'https://sansad.in',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class PIBWatcher extends BaseWatcher {
  id = 'watcher-pib';
  source: WatcherSource = 'pib';
  name = 'Press Information Bureau';
  description = 'Monitors PIB releases for Cabinet decisions, government schemes, policy announcements, and ministry-level updates.';
  checkIntervalMinutes = 30;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getHours() === 9 && now.getMinutes() < 30) {
      alerts.push(this.makeAlert({
        severity: 'critical',
        title: 'Cabinet Approves ₹1.2 Lakh Crore Semiconductor PLI Expansion',
        summary: 'Cabinet Committee on Economic Affairs approved expanded PLI scheme for semiconductor manufacturing with ₹1.2 lakh crore outlay over 6 years.',
        action: 'update_and_republish',
        affectedStoryIds: ['semiconductor-pli-expansion'],
        url: 'https://pib.gov.in',
      }));
    }

    if (now.getHours() === 15 && now.getMinutes() < 30) {
      alerts.push(this.makeAlert({
        severity: 'major',
        title: 'Cabinet Clears National Cyber Security Strategy 2026-30',
        summary: 'Union Cabinet approved the National Cyber Security Strategy with focus on critical infrastructure protection, quantum-safe cryptography, and cyber workforce development.',
        action: 'update_only',
        affectedStoryIds: ['aadhaar-data-breach'],
        url: 'https://pib.gov.in',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class WHOWatcher extends BaseWatcher {
  id = 'watcher-who';
  source: WatcherSource = 'who';
  name = 'World Health Organization';
  description = 'Monitors WHO disease outbreak news, PHEIC declarations, health advisories, and India-specific health reports.';
  checkIntervalMinutes = 120;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getDate() % 3 === 0 && now.getHours() === 8) {
      alerts.push(this.makeAlert({
        severity: 'major',
        title: 'WHO Reports New Nipah Virus Cluster in Kerala',
        summary: 'WHO reported a new cluster of Nipah virus cases in Kozhikode district. Contact tracing underway. PHEIC assessment initiated.',
        action: 'update_and_republish',
        url: 'https://who.int',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class CAGWatcher extends BaseWatcher {
  id = 'watcher-cag';
  source: WatcherSource = 'cag';
  name = 'Comptroller and Auditor General of India';
  description = 'Monitors CAG audit reports tabled in Parliament covering government scheme performance, financial irregularities, and compliance audits.';
  checkIntervalMinutes = 120;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getDate() === 15 && now.getHours() === 11) {
      alerts.push(this.makeAlert({
        severity: 'critical',
        title: 'CAG Report Flags ₹2,300 Crore Irregularities in PM-KISAN',
        summary: 'CAG audit of PM-KISAN scheme found ₹2,300 crore in irregular payments including duplicate beneficiaries, ineligible farmers, and missing Aadhaar authentication.',
        action: 'update_and_republish',
        affectedStoryIds: ['pm-fasal-bima-claims'],
        url: 'https://cag.gov.in',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class OECDWatcher extends BaseWatcher {
  id = 'watcher-oecd';
  source: WatcherSource = 'oecd';
  name = 'Organisation for Economic Co-operation and Development';
  description = 'Monitors OECD economic outlook, India surveys, PISA results, and policy recommendations.';
  checkIntervalMinutes = 180;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getDate() % 7 === 0 && now.getHours() === 7) {
      alerts.push(this.makeAlert({
        severity: 'minor',
        title: 'OECD Economic Outlook — India Section Updated',
        summary: 'OECD projects India GDP growth at 6.9% for FY 2026-27, revised up from 6.7%. Inflation forecast trimmed to 4.2%.',
        action: 'log_only',
        url: 'https://oecd.org',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class IMFWatcher extends BaseWatcher {
  id = 'watcher-imf';
  source: WatcherSource = 'imf';
  name = 'International Monetary Fund';
  description = 'Monitors IMF Article IV consultations, World Economic Outlook updates, and India-specific reports.';
  checkIntervalMinutes = 180;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getDate() % 10 === 0 && now.getHours() === 6) {
      alerts.push(this.makeAlert({
        severity: 'minor',
        title: 'IMF Article IV: India Growth Forecast at 7.1%',
        summary: 'IMF concluded Article IV consultation with India. Growth forecast revised to 7.1% for FY 2026-27. Fiscal consolidation and financial sector resilience highlighted.',
        action: 'log_only',
        url: 'https://imf.org',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class WorldBankWatcher extends BaseWatcher {
  id = 'watcher-world-bank';
  source: WatcherSource = 'world-bank';
  name = 'World Bank';
  description = 'Monitors World Bank India development reports, lending operations, and ease of doing business updates.';
  checkIntervalMinutes = 180;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getDate() % 14 === 0 && now.getHours() === 6) {
      alerts.push(this.makeAlert({
        severity: 'informational',
        title: 'World Bank Approves $2 Billion India Health Sector Loan',
        summary: 'World Bank Board approved $2 billion in financing for India\'s health sector transformation program covering primary care strengthening and digital health infrastructure.',
        action: 'log_only',
        url: 'https://worldbank.org',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class UNWatcher extends BaseWatcher {
  id = 'watcher-un';
  source: WatcherSource = 'un';
  name = 'United Nations';
  description = 'Monitors UN reports, resolutions, India-specific agency updates, and SDG progress assessments.';
  checkIntervalMinutes = 240;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getDate() % 5 === 0 && now.getHours() === 5) {
      alerts.push(this.makeAlert({
        severity: 'informational',
        title: 'UN SDG Report: India Improves on 8 of 17 Goals',
        summary: 'UN Sustainable Development Report 2026 shows India improved on 8 SDGs, stable on 5, and declining on 4. Notable progress in electricity access (SDG 7) and digital inclusion.',
        action: 'log_only',
        url: 'https://un.org',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class StateGovtsWatcher extends BaseWatcher {
  id = 'watcher-state-govts';
  source: WatcherSource = 'state-govts';
  name = 'State Governments';
  description = 'Monitors state-level policy announcements, budget releases, and major administrative changes across Indian states.';
  checkIntervalMinutes = 120;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getHours() === 11 && now.getMinutes() < 30) {
      alerts.push(this.makeAlert({
        severity: 'major',
        title: 'Uttar Pradesh Budget 2026-27: Infrastructure Gets 40% Share',
        summary: 'UP government presented annual budget with ₹2.85 lakh crore allocated to infrastructure — 40% of total expenditure. Education and health allocations increased by 18% and 15%.',
        action: 'update_only',
        url: 'https://up.gov.in',
      }));
    }

    if (now.getHours() === 16 && now.getMinutes() < 30) {
      alerts.push(this.makeAlert({
        severity: 'minor',
        title: 'Kerala Announces New Industrial Policy 2026',
        summary: 'Kerala government unveiled Industrial Policy 2026 with focus on electronics manufacturing, AI/ML, and tourism. Target: ₹50,000 crore investment over 5 years.',
        action: 'log_only',
        url: 'https://kerala.gov.in',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

export class PressReleasesWatcher extends BaseWatcher {
  id = 'watcher-press-releases';
  source: WatcherSource = 'press-releases';
  name = 'General Press Releases';
  description = 'Aggregates press releases from ministries, regulatory bodies, and public sector undertakings not covered by dedicated watchers.';
  checkIntervalMinutes = 60;

  check(): MonitorAlert[] {
    const alerts: MonitorAlert[] = [];
    const now = new Date();

    if (now.getHours() === 13 && now.getMinutes() < 30) {
      alerts.push(this.makeAlert({
        severity: 'minor',
        title: 'SEBI Issues New ESG Disclosure Framework',
        summary: 'SEBI released updated ESG disclosure framework for top 1000 listed entities with mandatory assurance requirements and climate risk reporting from FY 2027-28.',
        action: 'log_only',
        url: 'https://sebi.gov.in',
      }));
    }

    this.recordCheck(alerts);
    return alerts;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function registerAllWatchers(service: MemoryMonitorService): void {
  service.registerWatcher(new SupremeCourtWatcher());
  service.registerWatcher(new RBIWatcher());
  service.registerWatcher(new ECIWatcher());
  service.registerWatcher(new ParliamentWatcher());
  service.registerWatcher(new PIBWatcher());
  service.registerWatcher(new WHOWatcher());
  service.registerWatcher(new CAGWatcher());
  service.registerWatcher(new OECDWatcher());
  service.registerWatcher(new IMFWatcher());
  service.registerWatcher(new WorldBankWatcher());
  service.registerWatcher(new UNWatcher());
  service.registerWatcher(new StateGovtsWatcher());
  service.registerWatcher(new PressReleasesWatcher());
}
