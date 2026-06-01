export function normalizeProductSourceUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isValidProductSourceUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateProductSourceUrl(value: unknown): string | undefined {
  const normalized = normalizeProductSourceUrl(value);
  if (!normalized) return undefined;

  if (!isValidProductSourceUrl(normalized)) {
    throw new Error("Source URL must be a valid HTTP or HTTPS URL");
  }

  return normalized;
}
