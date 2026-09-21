import { CATEGORY_KEYWORDS } from './categoryKeywords';
import { DEFAULT_CATEGORY } from './categories';

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[_\-/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matcher keyword i tekst.
 * Korte keywords (< 4 tegn) kræver ordgrænse for at undgå
 * falske hits (fx "te" i "tomater", "ris" i "pris").
 */
function matchesKeyword(text, keyword) {
  const kw = normalize(keyword);
  if (!kw) return false;

  if (kw.length < 4) {
    const pattern = new RegExp(
      `(^|[^\\p{L}0-9])${escapeRegex(kw)}([^\\p{L}0-9]|$)`,
      'iu'
    );
    return pattern.test(text);
  }

  return text.includes(kw);
}

// Flat liste sorteret efter længde (længste først = mere præcist match)
const KEYWORD_INDEX = Object.entries(CATEGORY_KEYWORDS)
  .flatMap(([category, keywords]) =>
    keywords.map((keyword) => ({
      category,
      keyword: normalize(keyword),
    }))
  )
  .filter((entry) => entry.keyword.length > 0)
  .sort((a, b) => b.keyword.length - a.keyword.length);

/**
 * Gætter kategori ud fra produktnavn.
 * Returnerer altid en kategori (fallback: Andet).
 */
export function categorizeProduct(name) {
  const text = normalize(name || '');
  if (!text) return DEFAULT_CATEGORY;

  for (const entry of KEYWORD_INDEX) {
    if (matchesKeyword(text, entry.keyword)) {
      return entry.category;
    }
  }

  return DEFAULT_CATEGORY;
}
