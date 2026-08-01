// ── Fix Merge Domain Service (AR-13A.0 Specification) ─────────────────────

import { IFixRepository } from './fix-repository.service';
import { CreateFixDTO } from './fix-domain.types';
import { Fix } from '../../types/canonical';

export class FixMergeService {
  constructor(private fixRepository: IFixRepository) {}

  /**
   * Merges multiple source Fixes into a single canonical target Fix.
   * Marks all sources as superseded and links them to the target Fix.
   */
  public async executeMerge(sourceFixIds: string[], targetPayload: CreateFixDTO, editorId: string): Promise<Fix> {
    if (!sourceFixIds || sourceFixIds.length < 2) {
      throw new Error('FixMergeService requires at least two source Fix IDs.');
    }

    return this.fixRepository.merge(sourceFixIds, targetPayload, editorId);
  }
}
