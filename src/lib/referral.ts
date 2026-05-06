const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode() {
  const segment = (length: number) =>
    Array.from({ length }, () =>
      REFERRAL_ALPHABET[Math.floor(Math.random() * REFERRAL_ALPHABET.length)]
    ).join("");

  return `IMP-${segment(3)}-${segment(3)}`;
}

export function normalizeReferralCode(code: string) {
  return code.trim().toUpperCase();
}
