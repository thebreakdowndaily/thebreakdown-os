import { describe, it, expect } from 'vitest';
import { resolveLocation, getGeoHierarchy, GEO_NODES } from '@/data/radar/geo-india';

describe('Expanded Geo-India Hierarchy', () => {
  it('resolves English and Hindi city and district names', () => {
    const rewaHi = resolveLocation('रीवा');
    expect(rewaHi?.id).toBe('rewa-district');

    const bhopal = resolveLocation('Bhopal');
    expect(bhopal?.id).toBe('bhopal-district');

    const indoreHi = resolveLocation('इंदौर');
    expect(indoreHi?.id).toBe('indore-district');

    const jabalpur = resolveLocation('Jabalpur');
    expect(jabalpur?.id).toBe('jabalpur-district');

    const gwalior = resolveLocation('Gwalior');
    expect(gwalior?.id).toBe('gwalior-district');

    const satna = resolveLocation('Satna');
    expect(satna?.id).toBe('satna-district');
  });

  it('builds complete upward hierarchy path to country', () => {
    const path = getGeoHierarchy('rewa-city');
    const ids = path.map((n) => n.id);

    expect(ids).toContain('rewa-city');
    expect(ids).toContain('rewa-district');
    expect(ids).toContain('rewa-division');
    expect(ids).toContain('mp');
    expect(ids).toContain('india');
  });

  it('provides valid geographic coordinates for all major hubs', () => {
    const hubs = ['rewa-district', 'bhopal-district', 'indore-district', 'jabalpur-district', 'gwalior-district', 'sagar-district', 'satna-district'];
    for (const hubId of hubs) {
      const node = GEO_NODES[hubId];
      expect(node).toBeDefined();
      expect(typeof node.latitude).toBe('number');
      expect(typeof node.longitude).toBe('number');
      expect(node.latitude!).toBeGreaterThan(20);
      expect(node.longitude!).toBeGreaterThan(70);
    }
  });
});
