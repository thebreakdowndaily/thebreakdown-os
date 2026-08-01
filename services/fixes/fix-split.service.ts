// ── Fix Split Domain Service (AR-13A.0 Specification) ─────────────────────

import { IFixRepository } from './fix-repository.service';
import { CreateFixDTO } from './fix-domain.types';
import { Fix } from '../../types/canonical';

export class FixSplitService {
  constructor(private fixRepository: IFixRepository) {}

  /**
   * Splits a single source Fix into multiple targeted Fixes.
   * Archives the source Fix with split provenance notes.
   */
  public async executeSplit(sourceFixId: string, targetPayloads: CreateFixDTO[], editorId: string): Promise<Fix[]> {
    if (!targetPayloads || targetPayloads.length < 2) {
      throw new Error('FixSplitService requires at least two target payload DTOs.');
    }

    return this.fixRepository.split(sourceFixId, targetPayloads, editorId);
  }
}
