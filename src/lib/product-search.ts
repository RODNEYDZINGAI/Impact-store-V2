export type SearchableProduct = {
  name?: string | null;
  brand?: string | null;
  sku?: string | null;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  createdAt?: Date | string | null;
};

export type ProductSearchMatchMode = "exact" | "fuzzy";

export type RankedProduct<T extends SearchableProduct> = T & {
  _searchScore?: number;
  _searchMatchMode?: ProductSearchMatchMode;
};

export type ProductSearchFallbackMode = "none" | "exact" | "fuzzy";

const FIELD_WEIGHTS: Array<[keyof SearchableProduct, number]> = [
  ["sku", 160],
  ["name", 120],
  ["brand", 80],
  ["subtitle", 55],
  ["category", 45],
  ["subcategory", 45],
  ["description", 20],
];

function normalizeSearchText(value: unknown) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenizeSearchText(value: unknown) {
  return normalizeSearchText(value).split(/\s+/).filter(Boolean);
}

function uniqueTokens(tokens: string[]) {
  return Array.from(new Set(tokens));
}

function levenshteinDistance(a: string, b: string) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + substitutionCost,
      );
    }
    for (let j = 0; j <= b.length; j++) previous[j] = current[j];
  }

  return previous[b.length];
}

function damerauLevenshteinDistance(a: string, b: string) {
  const baseDistance = levenshteinDistance(a, b);
  if (baseDistance <= 1) return baseDistance;

  for (let i = 0; i < a.length - 1; i++) {
    if (a[i] === b[i + 1] && a[i + 1] === b[i]) {
      const swapped = `${a.slice(0, i)}${a[i + 1]}${a[i]}${a.slice(i + 2)}`;
      if (swapped === b) return 1;
      return Math.min(baseDistance, 1 + levenshteinDistance(swapped, b));
    }
  }

  return baseDistance;
}

function typoToleranceForToken(token: string) {
  if (token.length <= 3) return 0;
  if (token.length <= 5) return 1;
  return 2;
}

function scoreTokenAgainstField(
  token: string,
  fieldValue: string,
  fieldWeight: number,
): { score: number; mode: ProductSearchMatchMode | undefined } {
  if (!token || !fieldValue) return { score: 0, mode: undefined };

  const fieldTokens = tokenizeSearchText(fieldValue);
  if (fieldValue === token) return { score: fieldWeight * 1.5, mode: "exact" };
  if (fieldValue.includes(token)) return { score: fieldWeight, mode: "exact" };
  if (fieldTokens.some((ft) => ft.startsWith(token))) {
    return { score: fieldWeight * 0.85, mode: "exact" };
  }

  const tolerance = typoToleranceForToken(token);
  if (tolerance === 0) return { score: 0, mode: undefined };

  let bestFuzzyScore = 0;
  for (const fieldToken of fieldTokens) {
    if (Math.abs(fieldToken.length - token.length) > tolerance) continue;
    const distance = damerauLevenshteinDistance(token, fieldToken);
    if (distance > 0 && distance <= tolerance) {
      const score = fieldWeight * (distance === 1 ? 0.62 : 0.44);
      bestFuzzyScore = Math.max(bestFuzzyScore, score);
    }
  }

  return bestFuzzyScore > 0
    ? { score: bestFuzzyScore, mode: "fuzzy" }
    : { score: 0, mode: undefined };
}

function createdAtTime(product: SearchableProduct) {
  if (!product.createdAt) return 0;
  const time = new Date(product.createdAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function rankProductsBySearch<T extends SearchableProduct>(
  products: T[],
  search: string | null | undefined,
): RankedProduct<T>[] {
  const normalizedQuery = normalizeSearchText(search);
  const queryTokens = uniqueTokens(tokenizeSearchText(normalizedQuery));
  if (!normalizedQuery || queryTokens.length === 0) return products as RankedProduct<T>[];

  const entries = products.map((product) => {
    let score = 0;
    let exactMatches = 0;
    let fuzzyMatches = 0;
    const fullName = normalizeSearchText(product.name);
    const fullSku = normalizeSearchText(product.sku);

    if (fullName === normalizedQuery) {
      score += 260;
      exactMatches += queryTokens.length;
    } else if (fullName.startsWith(normalizedQuery)) {
      score += 190;
      exactMatches += queryTokens.length;
    } else if (fullName.includes(normalizedQuery)) {
      score += 180;
      exactMatches += queryTokens.length;
    }

    if (fullName.includes(normalizedQuery) && normalizeSearchText(product.category).includes("phone")) {
      score += 35;
    }

    if (fullSku === normalizedQuery) {
      score += 260;
      exactMatches += queryTokens.length;
    } else if (fullSku.includes(normalizedQuery.replace(/\s+/g, ""))) {
      score += 160;
      exactMatches += queryTokens.length;
    }

    for (const token of queryTokens) {
      let bestTokenScore = 0;
      let bestMode: ProductSearchMatchMode | undefined;
      for (const [field, fieldWeight] of FIELD_WEIGHTS) {
        const fieldValue = normalizeSearchText(product[field]);
        const result = scoreTokenAgainstField(token, fieldValue, fieldWeight);
        if (result.score > bestTokenScore) {
          bestTokenScore = result.score;
          bestMode = result.mode;
        }
      }
      if (bestTokenScore > 0) {
        score += bestTokenScore;
        if (bestMode === "exact") exactMatches += 1;
        if (bestMode === "fuzzy") fuzzyMatches += 1;
      }
    }

    if (fuzzyMatches > 0 && normalizeSearchText(product.category).includes("phone")) {
      score += 35;
    }

    const allTokensMatched = exactMatches + fuzzyMatches >= queryTokens.length;
    if (!allTokensMatched) score = 0;

    return {
      product,
      score,
      exactMatches,
      fuzzyMatches,
      mode: exactMatches > 0 ? ("exact" as const) : fuzzyMatches > 0 ? ("fuzzy" as const) : undefined,
    };
  });

  const hasExactEntries = entries.some((e) => e.score > 0 && e.exactMatches > 0);
  const ranked = entries
    .filter((e) => e.score > 0 && (!hasExactEntries || e.exactMatches > 0))
    .sort((a, b) => b.score - a.score || createdAtTime(b.product) - createdAtTime(a.product));

  return ranked.map(({ product, score, mode }) => ({
    ...product,
    _searchScore: Math.round(score),
    _searchMatchMode: mode,
  })) as RankedProduct<T>[];
}

export function shouldUseFuzzyFallback(
  products: Array<{ _searchMatchMode?: ProductSearchMatchMode }>,
) {
  return products.length > 0 && products.every((p) => p._searchMatchMode === "fuzzy");
}

export function getSearchFallbackMode(
  search: string | null | undefined,
  products: Array<{ _searchMatchMode?: ProductSearchMatchMode }>,
): ProductSearchFallbackMode {
  if (!normalizeSearchText(search)) return "none";
  if (products.length === 0) return "none";
  return shouldUseFuzzyFallback(products) ? "fuzzy" : "exact";
}
