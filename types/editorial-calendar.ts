// ─── Editorial Calendar Types ────────────────────────────────────────────────
// Governing document: AGENTS.md (Editorial Calendar + Autonomous Weekly Publishing)
//
// Every story slot on the editorial calendar is a knowledge object with a
// publication gate. Scheduled timestamp alone NEVER causes publication.
// Every gate check is auditable.

// ─── Schedule Status ─────────────────────────────────────────────────────────

export type ScheduleStatus =
  | 'planned'      // assigned to slot, story not yet written
  | 'in_progress'  // writer actively working
  | 'ready'        // story complete, awaiting validation
  | 'validated'    // publication gate passed
  | 'published'    // successfully published
  | 'blocked'      // gate failed, blocked with reason
  | 'skipped'      // intentionally not published (e.g., event cancelled)
  | 'rescheduled'; // moved to a different slot

export type ScheduleAction =
  | 'create'       // add story to calendar slot
  | 'update'       // modify slot details
  | 'validate'     // run publication gate
  | 'publish'      // execute publication
  | 'cancel'       // remove from calendar
  | 'reschedule'   // move to different slot
  | 'skip';        // mark as intentionally not published

export type TriggeredBy = 'cron' | 'manual' | 'fallback';

// ─── Schedule Entry ──────────────────────────────────────────────────────────

export interface EditorialScheduleEntry {
  id: string;
  storyId: string;
  slotDate: string;          // ISO date string (YYYY-MM-DD)
  slotPosition: number;      // 1-7 (Mon-Sun for a given week)
  priority: number;          // 1-10 (10 = highest)
  category: string;          // e.g., 'explainer', 'analysis', 'briefing'
  rationale?: string;        // why this story for this slot
  notes?: string;
  status: ScheduleStatus;
  validatedAt?: string;
  publishedAt?: string;
  blockedAt?: string;
  blockReason?: string;
  fallbackScheduleId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Publication Gate ─────────────────────────────────────────────────────────

export interface GateCheck {
  name: string;
  passed: boolean;
  reason: string;
  details?: string;
}

export interface PublicationGateResult {
  storyId: string;
  scheduleId?: string;
  passed: boolean;
  checks: GateCheck[];
  checkedAt: string;
  triggeredBy: TriggeredBy;
  publishedAt?: string;
}

export interface PublicationGateInput {
  storyId: string;
  scheduleId?: string;
  triggeredBy: TriggeredBy;
}

// ─── Weekly Plan ─────────────────────────────────────────────────────────────

export interface WeeklySlot {
  date: string;              // ISO date string
  dayName: string;           // e.g., 'Monday'
  dayIndex: number;          // 0=Mon, 6=Sun
  entry?: EditorialScheduleEntry;
}

export interface WeeklyPlan {
  weekStart: string;         // ISO date string (Monday)
  weekEnd: string;           // ISO date string (Sunday)
  slots: WeeklySlot[];
  totalEntries: number;
  publishedCount: number;
  blockedCount: number;
  pendingCount: number;
}

// ─── Seed Story Plan ─────────────────────────────────────────────────────────

export interface SeedStoryPlan {
  slotDate: string;
  slotPosition: number;
  category: string;
  title: string;
  summary: string;
  priority: number;
  rationale: string;
}
