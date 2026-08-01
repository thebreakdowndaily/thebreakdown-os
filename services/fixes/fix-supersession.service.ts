// ── Fix Supersession Domain Service (AR-13A.0 Specification) ───────────────

import { IFixRepository } from './fix-repository.service';
import { Fix } from '../../types/canonical';

export class FixSupersessionService {
  constructor(private fixRepository: IFixRepository) {}

  /**
   * Marks a Fix as superseded by another canonical Fix with rationale.
   */
  public async executeSupersede(sourceFixId: string, replacementFixId: string, rationale: string, editorId: string): Promise<Fix> {
    return this.fixRepository.supersede(sourceFixId, replacementFixId, rationale, editorId);
  }
}
