// Opslag af stregkoder i Open Food Facts – en gratis, åben produktdatabase
// (https://world.openfoodfacts.org). Kræver ingen API-nøgle.
const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = 'product_name,product_name_da,brands,categories_tags';
// Dårlig dækning i butikken må ikke give en spinner der kører i det uendelige
const TIMEOUT_MS = 8000;

/**
 * Returnerer { name, tags } for en stregkode, eller null hvis varen
 * ikke findes i databasen. Kaster en fejl ved netværksproblemer.
 */
export async function lookupBarcode(code) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${BASE_URL}/${code}.json?fields=${FIELDS}`, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok && response.status !== 404) {
    throw new Error(`Open Food Facts svarede ${response.status}`);
  }

  const json = await response.json();
  const product = json?.product;
  if (json?.status !== 1 || !product) return null;

  const baseName = (product.product_name_da || product.product_name || '').trim();
  if (!baseName) return null;

  // Samme "Vare - Mærke"-format som brugerne selv brugte i iteration 1
  const brand = (product.brands || '').split(',')[0].trim();
  const name =
    brand && !baseName.toLowerCase().includes(brand.toLowerCase())
      ? `${baseName} - ${brand}`
      : baseName;

  return { name, tags: product.categories_tags || [] };
}
