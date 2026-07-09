import { useMemo } from 'react';
import type { MapSpec } from '@/utils/types';
import type { RegionData } from '../config/theme';

export function useMapData(mapData: MapSpec['data']) {
  return useMemo(() => {
    const valueMap = new Map<string, number>();
    if (!mapData) return valueMap;

    let regions: RegionData[] = [];

    if (mapData.source) {
      try {
        const parsed: unknown = JSON.parse(mapData.source);
        if (Array.isArray(parsed)) {
          regions = parsed as RegionData[];
        }
      } catch {
        // Not JSON — ignore
      }
    }

    const joinKey = mapData.joinKey || 'id';
    const valueField = mapData.valueField || 'value';
    
    regions.forEach((r: RegionData) => {
      const rawKey = r[joinKey];
      const key = typeof rawKey === 'string' 
        ? rawKey 
        : typeof r.id === 'string' 
          ? r.id 
          : typeof r.name === 'string' 
            ? r.name 
            : '';
      const rawVal = r[valueField] ?? r.value;
      valueMap.set(key.toLowerCase(), Number(rawVal ?? 0));
    });

    return valueMap;
  }, [mapData]);
}
