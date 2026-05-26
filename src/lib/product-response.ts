type ProductLike = Record<string, unknown> & {
  toObject?: () => Record<string, unknown>;
};

function normalizeProduct(product: ProductLike) {
  const data = typeof product.toObject === "function" ? product.toObject() : product;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sourceUrl, ...publicProduct } = data;
  return publicProduct;
}

export function stripProductSourceUrls<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) =>
      item && typeof item === "object" ? normalizeProduct(item as ProductLike) : item
    ) as T;
  }

  if (data && typeof data === "object") {
    return normalizeProduct(data as ProductLike) as T;
  }

  return data;
}
