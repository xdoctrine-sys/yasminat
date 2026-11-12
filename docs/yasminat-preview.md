# Yasminat review release

The user authorized replacing the storefront at hamadstores.com with the current
Yasminat review implementation so it can be tested online on a physical phone.
This is a review release, not a claim of pixel-perfect parity across all states.

## Integration

- Native Next.js components inside the existing Mercur storefront. Original
  backend, admin and vendor applications retained.
- Approved assets and scoped source CSS live under `public/yasminat` and
  `src/components/yasminat/approved`. Home markup was converted to JSX, without
  runtime HTML injection. Lucide and font licenses are included with the assets.
- Published pages use the available device width up to the approved 1024px frame.
  `NEXT_PUBLIC_YASMINAT_REVIEW_WIDTH=390` is for the local desktop review only;
  it must not be set for deployment.
- Add, update and delete continue using Mercur seller offers and its cart API.
  A successful add message requires a confirmed increase from the backend.
- The existing email/password authentication remains. Mobile OTP and AI decor
  generation are not implemented; the decor movie is explicitly a concept video.
- Generated Mercur route types are checked in because the upstream client was
  previously instantiated with an empty route map. React types resolve to the
  storefront's React 19 types. Next's existing `ignoreBuildErrors` bypass was
  removed; type errors now fail the build.

## Preview data

`seed-yasminat-preview.ts` is additive and idempotent. Its default is a read-only
plan. It creates only batch-prefixed resources, never deletes old catalog data,
never creates auth identities or sends invitations, and never changes regions,
payment providers or store settings. The existing Qatar region, sales channel and
shipping profile are reused. Preview offers manage inventory, forbid backorders,
and have zero stock. Three original nurseries and three explicitly illustrative
stores are included, with the approved 13-product catalog and five CMS banners.

Images are copied into a batch-specific directory on the existing backend static
volume. Product/category/offer metadata and seller external identifiers carry
`yasminat-preview-2026-11`. Banner IDs have `hban_yasminat_preview_` prefixes. A
resource manifest is saved after each stage in the backend container's `/tmp`.
No cleanup/delete command runs automatically. Preserve the manifest before future
catalog replacement; review any removal separately.

When batch categories are present, navigation shows those categories while the
existing categories remain available to the admin. The hero API retains its
original `slots` payload and adds a scheduled active `banners` array for the
carousel. Preview banners take precedence while the batch is present.

## Validation and remaining visual work

- Full storefront TypeScript check passed before the final review build.
- Optimized Next release build passed with type checking enabled.
- Local release at 390px: header 151px, bottom navigation 66px, no horizontal
  overflow, and all observed images loaded.
- Local contract fixture: large/sand variant, quantity two produced QAR 400;
  decrement produced QAR 200; deletion restored the empty state. Invalid login
  stayed on the login screen. No real order/payment was submitted.
- Cart visual parity is still under review. Checkout, authentication and real
  order screens retain functional Mercur fields/layout portions and are not
  certified identical to the demonstration screens. English catalog labels also
  need a complete visual review. These are acknowledged review items.
- Physical phone testing is performed by the user after deployment; browser
  emulation is not a substitute for that test.
