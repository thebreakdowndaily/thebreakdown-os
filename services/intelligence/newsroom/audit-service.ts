/**
 * ─── Newsroom Audit Service (Newsroom Intelligence OS) ───────────────────────
 *
 * Core rule:
 * Append-only immutable persistent record of all human editorial decisions,
 * triage actions, alert acknowledgements, and system state transitions.
 */

import { NewsroomAuditLogRecord } from '@/types/newsroom-intelligence';

export class NewsroomAuditService {
  private static records: NewsroomAuditLogRecord[] = [];

  public static logAction(record: Omit<NewsroomAuditLogRecord, 'id' | 'timestamp'>): NewsroomAuditLogRecord {
    const fullRecord: NewsroomAuditLogRecord = {
      ...record,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    this.records.push(Object.freeze({ ...fullRecord }));
    return fullRecord;
  }

  public static getAuditTrail(filter?: { signalId?: string; actorId?: string; limit?: number }): readonly NewsroomAuditLogRecord[] {
    let list = [...this.records];
    if (filter?.signalId) {
      list = list.filter((r) => r.signalId === filter.signalId);
    }
    if (filter?.actorId) {
      list = list.filter((r) => r.actorId === filter.actorId);
    }
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return Object.freeze(list);
  }

  public static clear(): void {
    this.records = [];
  }

  /** Append-only ledger snapshot for persistence (Operating Standard §20). */
  public static getAllRecords(): readonly NewsroomAuditLogRecord[] {
    return Object.freeze([...this.records]);
  }

  /** Restores the ledger from a persisted snapshot during bootstrap. */
  public static restoreAll(records: readonly NewsroomAuditLogRecord[]): void {
    this.records = records.map((r) => Object.freeze({ ...r }));
  }
}
