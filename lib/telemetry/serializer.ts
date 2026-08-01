// ── Telemetry Serializer & Schema Evolution Engine (Phase 17C WP6 / Recommendation 6) ──

import { TelemetryProjection } from '../../types/telemetry';

export interface SerializedTelemetryPayload {
  schemaVersion: number;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  checksum: string;
  data: TelemetryProjection;
}

export class TelemetrySerializer {
  /**
   * Generates a simple deterministic hash checksum for verifying payload integrity.
   */
  private static computeChecksum(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `chk-${Math.abs(hash).toString(16)}`;
  }

  /**
   * Sorts object keys recursively to guarantee deterministic JSON output.
   */
  private static sortKeys(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sortKeys(item));
    }

    const sortedObj: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).sort();

    for (const key of keys) {
      sortedObj[key] = this.sortKeys((obj as Record<string, unknown>)[key]);
    }

    return sortedObj;
  }

  /**
   * Serializes a TelemetryProjection into a deterministic JSON string with metadata.
   */
  public static serialize(projection: TelemetryProjection): string {
    const payload: SerializedTelemetryPayload = {
      schemaVersion: 1,
      projectionVersion: projection.projectionVersion || 1,
      platformVersion: projection.platformVersion || 'AR-13A.0',
      generatedAt: projection.generatedAt,
      checksum: '',
      data: projection,
    };

    const canonicalObj = this.sortKeys(payload) as SerializedTelemetryPayload;
    const jsonWithoutChecksum = JSON.stringify(canonicalObj);
    canonicalObj.checksum = this.computeChecksum(jsonWithoutChecksum);

    return JSON.stringify(canonicalObj, null, 2);
  }

  /**
   * Deserializes and validates a telemetry JSON payload.
   */
  public static deserialize(jsonString: string): TelemetryProjection {
    const parsed = JSON.parse(jsonString) as SerializedTelemetryPayload;

    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      throw new Error('Telemetry Deserialization Error: Invalid payload structure.');
    }

    if (parsed.schemaVersion > 1) {
      throw new Error(`Telemetry Deserialization Error: Unsupported future schemaVersion ${parsed.schemaVersion}.`);
    }

    return parsed.data;
  }
}
