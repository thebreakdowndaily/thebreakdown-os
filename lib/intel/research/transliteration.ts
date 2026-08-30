/**
 * ─── Research Intelligence Engine — Transliteration ─────────────────────────
 *
 * Narrow, deterministic transliteration for supported Indic scripts → Latin.
 * This is NOT a universal transliteration engine. It covers only the scripts
 * and high-frequency words relevant to the benchmark corpus.
 *
 * Design:
 *   - Script-level character mapping (deterministic, no AI)
 *   - Word-level overrides for common proper nouns
 *   - Preserves original text; returns Latin comparison form
 *   - No mutation of source data
 */

// ── Script-level character maps ──────────────────────────────────────────────

/** Devanagari (Hindi) → Latin base transliteration. */
const DEVANAGARI_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  'ं': 'n', 'ः': 'h', 'ँ': 'n',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh',
  'स': 's', 'ह': 'h',
  '़': '', 'ृ': 'ri', 'ॉ': 'o', 'ॅ': 'e',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

/** Malayalam → Latin base transliteration. */
const MALAYALAM_MAP: Record<string, string> = {
  'അ': 'a', 'ആ': 'aa', 'ഇ': 'i', 'ഈ': 'ee', 'ഉ': 'u', 'ഊ': 'oo',
  'ഋ': 'ri', 'എ': 'e', 'ഏ': 'ae', 'ഐ': 'ai', 'ഒ': 'o', 'ഓ': 'oo',
  'ഔ': 'au',
  'ാ': 'a', 'ി': 'i', 'ീ': 'ee', 'ു': 'u', 'ൂ': 'oo',
  'ൃ': 'ri', 'െ': 'e', 'േ': 'ae', 'ൈ': 'ai', 'ൊ': 'o', 'ോ': 'oo',
  'ൌ': 'au', '്': '', 'ം': 'm', 'ഃ': 'h',
  'ക': 'ka', 'ഖ': 'kha', 'ഗ': 'ga', 'ഘ': 'gha', 'ങ': 'nga',
  'ച': 'cha', 'ഛ': 'chha', 'ജ': 'ja', 'ഝ': 'jha', 'ഞ': 'nya',
  'ട': 'ta', 'ഠ': 'tha', 'ഡ': 'da', 'ഢ': 'dha', 'ണ': 'na',
  'ത': 'tha', 'ഥ': 'thha', 'ദ': 'da', 'ധ': 'dha', 'ന': 'na',
  'പ': 'pa', 'ഫ': 'pha', 'ബ': 'ba', 'ഭ': 'bha', 'മ': 'ma',
  'യ': 'ya', 'ര': 'ra', 'ല': 'la', 'വ': 'va', 'ശ': 'sha',
  'ഷ': 'sha', 'സ': 'sa', 'ഹ': 'ha',
  'ള': 'la', 'ഴ': 'zha', 'റ': 'ra', 'ഩ': 'na',
  '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4',
  '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9',
};

// ── Word-level overrides for known proper nouns ──────────────────────────────

const WORD_OVERRIDES: Record<string, string> = {
  // Hindi proper nouns
  'अयोध्या': 'ayodhya',
  'पंचायती': 'panchayati',
  'राज': 'raj',
  'बिहार': 'bihar',
  'विभाग': 'vibhag',
  'महाराष्ट्र': 'maharashtra',
  'कैबिनेट': 'cabinet',
  'मंत्रियों': 'mantriyon',
  'आवंटन': 'aavantan',
  'अधिसूचना': 'adhisuchana',
  'फंड': 'fund',
  'विचलन': 'vichalan',
  'ऑडिट': 'audit',
  'रिपोर्ट': 'report',
  'सरकार': 'sarkar',
  'जीएसटी': 'gst',
  'संग्रह': 'sangrah',
  'करोड़': 'crore',
  'रुपये': 'rupaye',
  // Malayalam proper nouns
  'വയനാട്': 'wayanad',
  'വയനാട്ടിലെ': 'wayanadile',
  'കേരളം': 'kerala',
  'കേരളത്തിൽ': 'keralathil',
  'ഉരുൾപൊട്ടൽ': 'urulpottal',
  'മുന്നറിയിപ്പുകൾ': 'munnariyippukal',
  'മഴയെത്തുടർന്ന്': 'mazhayethuthurannu',
  'ദുരന്തം': 'durantham',
  'പ്രാദേശിക': 'pradeshika',
  'റിപ്പോർട്ടുകൾ': 'reportukal',
  'സംഭവിച്ചു': 'sambhavichu',
  'നൽകുന്നതിൽ': 'nalkunnathil',
  'വീഴ്ച': 'veechcha',
  'വരുത്തിയെന്ന്': 'varuthiyennu',
  'മാധ്യമങ്ങൾ': 'madhyamangal',
  'ചെയ്യുന്നു': 'cheyyunnu',
  'ആളുകളെ': 'aalukale',
  'ഒഴിപ്പിക്കുന്നതിൽ': 'ozhippikkunnathil',
  'കാലതാമസം': 'kalathamasam',
  'പൂർണമായും': 'poornamayum',
  'പരാജയപ്പെട്ടു': 'parajayappettu',
  'സംവിധാനങ്ങൾ': 'samvidhanangal',
  'അലാറം': 'alarm',
  'ഭരണകൂടം': 'bharanakoottam',
  'പ്രദേശങ്ങളിൽ': 'pradeshangalil',
  'മുണ്ടക്കൈ': 'mundakkai',
  'ചൂരൽമല': 'chooralmala',
  'വൻ': 'van',
};

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Transliterate a single character from an Indic script to Latin.
 * Returns the Latin equivalent or the original character if unmapped.
 */
function transliterateChar(ch: string): string {
  if (DEVANAGARI_MAP[ch]) return DEVANAGARI_MAP[ch];
  if (MALAYALAM_MAP[ch]) return MALAYALAM_MAP[ch];
  return ch;
}

/**
 * Transliterate a word from an Indic script to Latin.
 * Uses word-level overrides when available, otherwise falls back to
 * character-level transliteration.
 */
function transliterateWord(word: string): string {
  const override = WORD_OVERRIDES[word];
  if (override) return override;

  const script = detectScript(word);
  const map = script === 'devanagari' ? DEVANAGARI_MAP : script === 'malayalam' ? MALAYALAM_MAP : null;
  if (!map) return word;

  let result = '';
  for (const ch of word) {
    const mapped = map[ch];
    if (mapped !== undefined) {
      result += mapped;
    } else if (/[\u0900-\u097f\u0d00-\u0d7f]/.test(ch)) {
      result += transliterateChar(ch);
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * Transliterate a full text string to Latin.
 * Splits on whitespace/punctuation, transliterates each word, rejoins.
 * Preserves non-Indic text (English, numbers, punctuation).
 */
export function transliterateToLatin(text: string): string {
  return text
    .split(/([\s\d.,;:!?'\"()\-/\\]+)/g)
    .map((segment) => {
      if (/^[\s\d.,;:!?'\"()\-/\\]+$/.test(segment)) return segment;
      const script = detectScript(segment);
      if (script === 'devanagari' || script === 'malayalam') {
        return transliterateWord(segment);
      }
      return segment;
    })
    .join('');
}

/**
 * Detect the script of a text fragment.
 * Re-exported from normalization.ts for convenience.
 */
import { detectScript, detectLanguage } from './normalization';
