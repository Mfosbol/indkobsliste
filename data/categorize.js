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

// Open Food Facts bruger engelske kategori-tags (fx "en:dairies").
// Rækkefølgen betyder noget: de mest specifikke står først.
const OFF_TAG_CATEGORIES = [
  ['frozen', 'Frost'],
  ['dair', 'Mejeri'],
  ['milk', 'Mejeri'],
  ['cheese', 'Mejeri'],
  ['yogurt', 'Mejeri'],
  ['butter', 'Mejeri'],
  ['egg', 'Mejeri'],
  ['meat', 'Kød og fisk'],
  ['fish', 'Kød og fisk'],
  ['seafood', 'Kød og fisk'],
  ['bread', 'Brød og bagværk'],
  ['biscuit', 'Snacks og slik'],
  ['chocolate', 'Snacks og slik'],
  ['candies', 'Snacks og slik'],
  ['confectioner', 'Snacks og slik'],
  ['snack', 'Snacks og slik'],
  ['chips', 'Snacks og slik'],
  ['beverage', 'Drikkevarer'],
  ['drink', 'Drikkevarer'],
  ['juice', 'Drikkevarer'],
  ['coffee', 'Kolonial'],
  ['oil', 'Kolonial'],
  ['fruit', 'Frugt og grønt'],
  ['vegetable', 'Frugt og grønt'],
  ['pasta', 'Kolonial'],
  ['cereal', 'Kolonial'],
  ['sauce', 'Kolonial'],
  ['canned', 'Kolonial'],
];

/**
 * Gætter kategori for en scannet vare: først ud fra navnet (samme
 * nøgleordsliste som resten af appen), ellers ud fra Open Food Facts' tags.
 */
export function categorizeScannedProduct(name, tags = []) {
  const fromName = categorizeProduct(name);
  if (fromName !== DEFAULT_CATEGORY) return fromName;

  // OFF lister tags fra generel til specifik, så vi starter bagfra. Hvert tag
  // splittes i ord, og et fragment skal stå i starten af et ord – ellers
  // matcher fx "egg" i "veggie". Brede tags som "plant-based-foods-and-
  // beverages" springes over, da de ellers gør madolie til en drikkevare.
  const specificTags = [...tags]
    .reverse()
    .map((tag) => tag.toLowerCase())
    .filter((tag) => !tag.includes('plant-based-foods'));

  for (const tag of specificTags) {
    const words = tag.split(/[:\-\s]+/);
    const match = OFF_TAG_CATEGORIES.find(([fragment]) =>
      words.some((word) => word.startsWith(fragment))
    );
    if (match) return match[1];
  }
  return DEFAULT_CATEGORY;
}
