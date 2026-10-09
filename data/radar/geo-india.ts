export interface GeoNode {
  id: string;
  name: string;
  nameHi?: string; // Hindi name
  aliases: string[];
  level: 'country' | 'state' | 'division' | 'district' | 'city' | 'municipality';
  parentId?: string;
  latitude?: number;
  longitude?: number;
}

export const GEO_NODES: Record<string, GeoNode> = {
  india: {
    id: 'india',
    name: 'India',
    nameHi: 'भारत',
    aliases: ['भारत', 'India', 'Bharat', 'Hindustan'],
    level: 'country',
    latitude: 20.5937,
    longitude: 78.9629,
  },
  mp: {
    id: 'mp',
    name: 'Madhya Pradesh',
    nameHi: 'मध्य प्रदेश',
    aliases: ['मध्य प्रदेश', 'Madhya Pradesh', 'MP', 'M.P.', 'म.प्र.'],
    level: 'state',
    parentId: 'india',
    latitude: 22.9734,
    longitude: 78.6569,
  },
  // Divisions
  'rewa-division': {
    id: 'rewa-division',
    name: 'Rewa Division',
    nameHi: 'रीवा संभाग',
    aliases: ['रीवा संभाग', 'Rewa Division', 'विंध्य', 'Vindhya'],
    level: 'division',
    parentId: 'mp',
    latitude: 24.5362,
    longitude: 81.3037,
  },
  // Rewa
  'rewa-district': {
    id: 'rewa-district',
    name: 'Rewa',
    nameHi: 'रीवा',
    aliases: ['रीवा', 'Rewa', 'रीवा जिला', 'Rewa District'],
    level: 'district',
    parentId: 'rewa-division',
    latitude: 24.5362,
    longitude: 81.3037,
  },
  'rewa-city': {
    id: 'rewa-city',
    name: 'Rewa City',
    nameHi: 'रीवा शहर',
    aliases: ['रीवा शहर', 'Rewa City'],
    level: 'city',
    parentId: 'rewa-district',
    latitude: 24.5362,
    longitude: 81.3037,
  },
  // Bhopal
  'bhopal-district': {
    id: 'bhopal-district',
    name: 'Bhopal',
    nameHi: 'भोपाल',
    aliases: ['भोपाल', 'Bhopal', 'भोपाल जिला', 'Bhopal District'],
    level: 'district',
    parentId: 'mp',
    latitude: 23.2599,
    longitude: 77.4126,
  },
  'bhopal-city': {
    id: 'bhopal-city',
    name: 'Bhopal City',
    nameHi: 'भोपाल शहर',
    aliases: ['भोपाल शहर', 'Bhopal City'],
    level: 'city',
    parentId: 'bhopal-district',
    latitude: 23.2599,
    longitude: 77.4126,
  },
  // Indore
  'indore-district': {
    id: 'indore-district',
    name: 'Indore',
    nameHi: 'इंदौर',
    aliases: ['इंदौर', 'Indore', 'इंदौर जिला', 'Indore District', 'मालवा', 'Malwa'],
    level: 'district',
    parentId: 'mp',
    latitude: 22.7196,
    longitude: 75.8577,
  },
  'indore-city': {
    id: 'indore-city',
    name: 'Indore City',
    nameHi: 'इंदौर शहर',
    aliases: ['इंदौर शहर', 'Indore City'],
    level: 'city',
    parentId: 'indore-district',
    latitude: 22.7196,
    longitude: 75.8577,
  },
  // Jabalpur
  'jabalpur-district': {
    id: 'jabalpur-district',
    name: 'Jabalpur',
    nameHi: 'जबलपुर',
    aliases: ['जबलपुर', 'Jabalpur', 'जबलपुर जिला', 'Jabalpur District', 'महाकौशल', 'Mahakoshal'],
    level: 'district',
    parentId: 'mp',
    latitude: 23.1815,
    longitude: 79.9864,
  },
  'jabalpur-city': {
    id: 'jabalpur-city',
    name: 'Jabalpur City',
    nameHi: 'जबलपुर शहर',
    aliases: ['जबलपुर शहर', 'Jabalpur City'],
    level: 'city',
    parentId: 'jabalpur-district',
    latitude: 23.1815,
    longitude: 79.9864,
  },
  // Gwalior
  'gwalior-district': {
    id: 'gwalior-district',
    name: 'Gwalior',
    nameHi: 'ग्वालियर',
    aliases: ['ग्वालियर', 'Gwalior', 'ग्वालियर जिला', 'Gwalior District', 'चंबल', 'Chambal'],
    level: 'district',
    parentId: 'mp',
    latitude: 26.2183,
    longitude: 78.1828,
  },
  'gwalior-city': {
    id: 'gwalior-city',
    name: 'Gwalior City',
    nameHi: 'ग्वालियर शहर',
    aliases: ['ग्वालियर शहर', 'Gwalior City'],
    level: 'city',
    parentId: 'gwalior-district',
    latitude: 26.2183,
    longitude: 78.1828,
  },
  // Sagar
  'sagar-district': {
    id: 'sagar-district',
    name: 'Sagar',
    nameHi: 'सागर',
    aliases: ['सागर', 'Sagar', 'सागर जिला', 'Sagar District', 'बुंदेलखंड', 'Bundelkhand'],
    level: 'district',
    parentId: 'mp',
    latitude: 23.8388,
    longitude: 78.7378,
  },
  'sagar-city': {
    id: 'sagar-city',
    name: 'Sagar City',
    nameHi: 'सागर शहर',
    aliases: ['सागर शहर', 'Sagar City'],
    level: 'city',
    parentId: 'sagar-district',
    latitude: 23.8388,
    longitude: 78.7378,
  },
  // Satna
  'satna-district': {
    id: 'satna-district',
    name: 'Satna',
    nameHi: 'सतना',
    aliases: ['सतना', 'Satna', 'सतना जिला', 'Satna District', 'मैहर', 'Maihar'],
    level: 'district',
    parentId: 'rewa-division',
    latitude: 24.5824,
    longitude: 80.8293,
  },
  'satna-city': {
    id: 'satna-city',
    name: 'Satna City',
    nameHi: 'सतना शहर',
    aliases: ['सतना शहर', 'Satna City'],
    level: 'city',
    parentId: 'satna-district',
    latitude: 24.5824,
    longitude: 80.8293,
  },
};

/**
 * Precedence weights based on administrative specificity:
 * city (60) > municipality (50) > district (40) > division (30) > state (20) > country (10).
 */
const LEVEL_PRECEDENCE: Record<string, number> = {
  city: 60,
  municipality: 50,
  district: 40,
  division: 30,
  state: 20,
  country: 10,
};

/**
 * Word-boundary match index helper supporting both Latin and Unicode/Devanagari scripts.
 * Returns the character index of the match within the text, or -1 if no boundary match is found.
 */
function findMatchIndex(text: string, phrase: string): number {
  if (!text || !phrase) return -1;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})([^\\p{L}\\p{N}]|$)`, 'iu');
  const match = regex.exec(text);
  if (!match) return -1;
  return match.index + match[1].length;
}

/**
 * Resolves text to a GeoNode using deterministic administrative depth precedence
 * (city > municipality > district > division > state > country) and Unicode word boundaries.
 */
export function resolveLocation(text: string): GeoNode | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  const nodes = Object.values(GEO_NODES);

  interface MatchedCandidate {
    node: GeoNode;
    precedence: number;
    earliestIndex: number;
    defIndex: number;
  }

  let bestMatch: MatchedCandidate | null = null;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const precedence = LEVEL_PRECEDENCE[node.level] || 0;
    const phrases = [node.name, ...(node.nameHi ? [node.nameHi] : []), ...node.aliases];

    let earliestIdx = -1;
    for (const phrase of phrases) {
      const idx = findMatchIndex(trimmed, phrase);
      if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
        earliestIdx = idx;
      }
    }

    if (earliestIdx !== -1) {
      const candidate: MatchedCandidate = {
        node,
        precedence,
        earliestIndex: earliestIdx,
        defIndex: i,
      };

      if (!bestMatch) {
        bestMatch = candidate;
      } else if (candidate.precedence > bestMatch.precedence) {
        bestMatch = candidate;
      } else if (candidate.precedence === bestMatch.precedence) {
        if (candidate.earliestIndex < bestMatch.earliestIndex) {
          bestMatch = candidate;
        } else if (candidate.earliestIndex === bestMatch.earliestIndex && candidate.defIndex < bestMatch.defIndex) {
          bestMatch = candidate;
        }
      }
    }
  }

  return bestMatch ? bestMatch.node : null;
}

/**
 * Returns the geographic hierarchy path for a given node ID, from the node itself up to the country.
 */
export function getGeoHierarchy(nodeId: string): GeoNode[] {
  const path: GeoNode[] = [];
  let currentId: string | undefined = nodeId;

  while (currentId) {
    const node: GeoNode | undefined = GEO_NODES[currentId];
    if (!node) break;
    path.push(node);
    currentId = node.parentId;
  }

  return path;
}
