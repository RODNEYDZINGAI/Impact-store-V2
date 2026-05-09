# Impact Store Changelog

All Impact Store project changes should be documented here or in linked feature docs under `docs/`.

## 2026-05-09

### Changed

- Added a server-authoritative checkout pricing helper for BobPay order creation.
- BobPay checkout now recalculates product names, prices, subtotal, referral discount, shipping, and total on the server before creating orders or payment links.
- Added store-level promo settings defaults so referrals and future coupons can be globally guarded without trusting checkout client state.
- Added deterministic checkout pricing verification and removed checkout/referral/email debug logs that exposed operational details.

### Added

- Created `docs/impact-store-roadmap.md` after initial repository analysis.
- Captured project goal: a pleasant, high-converting B2B and B2C user experience with strong SEO.
- Documented initial backlog for variants management, admin upgrades, coupons/referrals toggles, SEO foundation, and request-a-quote functionality.
- Added planning/spec recovery docs:
  - `docs/technical-discovery.md`
  - `docs/features/product-variants.md`
  - `docs/features/request-a-quote.md`
  - `docs/features/coupons-referrals.md`
  - `docs/features/admin-upgrade.md`

### Notes

- Repository is on the `hermes` branch.
- Future implementation changes should include documentation updates in `docs/` before handoff.
- This recovery pass is documentation-only and does not implement production app code.
