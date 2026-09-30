export interface CanonicalEntity {
  id: string;
  name: string;
  nameHi?: string;
  type: 'government' | 'police' | 'court' | 'municipality' | 'institution' | 'political_party' | 'person';
  aliases: string[];
  jurisdiction?: string;
}

export const MP_CANONICAL_ENTITIES: CanonicalEntity[] = [
  {
    id: 'ent_gov_mp',
    name: 'Government of Madhya Pradesh',
    nameHi: 'मध्य प्रदेश सरकार',
    type: 'government',
    aliases: ['Government of Madhya Pradesh', 'MP Government', 'MP Govt', 'मध्य प्रदेश सरकार', 'मप्र सरकार', 'MP Gov', 'Govt of MP']
  },
  {
    id: 'ent_cm_mp',
    name: 'MP Chief Minister',
    nameHi: 'मुख्यमंत्री',
    type: 'person',
    aliases: ['MP Chief Minister', 'Chief Minister of MP', 'MP CM', 'CM MP', 'मुख्यमंत्री', 'सीएम']
  },
  {
    id: 'ent_hc_mp',
    name: 'MP High Court',
    nameHi: 'मध्य प्रदेश उच्च न्यायालय',
    type: 'court',
    aliases: ['MP High Court', 'High Court of MP', 'High Court of Madhya Pradesh', 'मध्य प्रदेश उच्च न्यायालय', 'हाईकोर्ट']
  },
  {
    id: 'ent_pol_mp',
    name: 'MP Police',
    nameHi: 'मध्य प्रदेश पुलिस',
    type: 'police',
    aliases: ['MP Police', 'Madhya Pradesh Police', 'मध्य प्रदेश पुलिस', 'मप्र पुलिस']
  },
  {
    id: 'ent_admin_rewa',
    name: 'Rewa District Administration',
    nameHi: 'रीवा जिला प्रशासन',
    type: 'government',
    aliases: ['Rewa District Administration', 'District Administration Rewa', 'रीवा जिला प्रशासन'],
    jurisdiction: 'geo_dist_rewa'
  },
  {
    id: 'ent_mc_rewa',
    name: 'Rewa Municipal Corporation',
    nameHi: 'रीवा नगर निगम',
    type: 'municipality',
    aliases: ['Rewa Municipal Corporation', 'RMC', 'रीवा नगर निगम', 'नगर निगम रीवा'],
    jurisdiction: 'geo_dist_rewa'
  },
  {
    id: 'ent_mc_bhopal',
    name: 'Bhopal Municipal Corporation',
    nameHi: 'भोपाल नगर निगम',
    type: 'municipality',
    aliases: ['Bhopal Municipal Corporation', 'BMC', 'भोपाल नगर निगम', 'नगर निगम भोपाल'],
    jurisdiction: 'geo_dist_bhopal'
  },
  {
    id: 'ent_mc_indore',
    name: 'Indore Municipal Corporation',
    nameHi: 'इंदौर नगर निगम',
    type: 'municipality',
    aliases: ['Indore Municipal Corporation', 'IMC', 'इंदौर नगर निगम', 'नगर निगम इंदौर'],
    jurisdiction: 'geo_dist_indore'
  },
  {
    id: 'ent_mc_jabalpur',
    name: 'Jabalpur Municipal Corporation',
    nameHi: 'जबलपुर नगर निगम',
    type: 'municipality',
    aliases: ['Jabalpur Municipal Corporation', 'JMC', 'जबलपुर नगर निगम', 'नगर निगम जबलपुर'],
    jurisdiction: 'geo_dist_jabalpur'
  },
  {
    id: 'ent_col_rewa',
    name: 'Collector Rewa',
    nameHi: 'कलेक्टर रीवा',
    type: 'government',
    aliases: ['Collector Rewa', 'Rewa Collector', 'कलेक्टर रीवा', 'रीवा कलेक्टर'],
    jurisdiction: 'geo_dist_rewa'
  },
  {
    id: 'ent_sp_rewa',
    name: 'SP Rewa',
    nameHi: 'एसपी रीवा',
    type: 'police',
    aliases: ['SP Rewa', 'Rewa SP', 'Superintendent of Police Rewa', 'एसपी रीवा', 'रीवा एसपी'],
    jurisdiction: 'geo_dist_rewa'
  },
  {
    id: 'ent_party_bjp',
    name: 'BJP (Madhya Pradesh unit)',
    nameHi: 'भाजपा',
    type: 'political_party',
    aliases: ['BJP', 'Bharatiya Janata Party', 'MP BJP', 'भाजपा', 'भारतीय जनता पार्टी']
  },
  {
    id: 'ent_party_inc',
    name: 'Congress (Madhya Pradesh unit)',
    nameHi: 'कांग्रेस',
    type: 'political_party',
    aliases: ['Congress', 'INC', 'Indian National Congress', 'MP Congress', 'कांग्रेस']
  }
];

/**
 * Resolves canonical entities from text using exact alias matching.
 * Case-insensitive. Returns unique entities.
 */
export function resolveEntities(text: string): CanonicalEntity[] {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const resolved = new Set<string>();
  const results: CanonicalEntity[] = [];

  for (const entity of MP_CANONICAL_ENTITIES) {
    for (const alias of entity.aliases) {
      if (lowerText.includes(alias.toLowerCase())) {
        if (!resolved.has(entity.id)) {
          resolved.add(entity.id);
          results.push(entity);
        }
        break; // matched this entity, skip other aliases
      }
    }
  }

  return results;
}
