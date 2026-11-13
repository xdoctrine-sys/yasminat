# Mobile review update — 13 November 2026

The user approved transferring the local design review to the existing Mercur
storefront and publishing it at hamadstores.com. The admin, seller portal,
authentication, inventory and checkout integrations remain native Mercur.

## Approved presentation

- Home: compact 28px announcement, separated truck icon, no side border or top
  rounding. A 40px search field shares the 68px logo/notification row; no mobile
  menu button or separate search block. Remove decorative English banner and
  logo subtitles. Offers remains below the shopping CTA and matches its height.
- All mobile breadcrumbs are visually hidden; their DOM and existing structured
  data remain. Page roots fill the viewport without a reserved bottom strip.
- Categories/listing/cart/checkout/stores/account/order pages use compact header
  titles with close subtitles and circular notification/back controls. Back is
  history-aware and reverses direction with the language. Header scrolls away;
  category choices or listing search/filter controls stay sticky.
- Product: no header; gallery begins 1px from the top and horizontal edges,
  retaining 16px corners. Horizontal scroll snapping and square thumbnail
  controls use actual product images. Selected thumbnail border is 1px at 50%
  opacity, painted over the image with no inner spacing.
- Favourites has no header. Login/register have no header or bottom navigation.
  Order details/tracking/list have compact headers and no bottom navigation.
- Other pages' bottom navigation hides on downward scroll and returns on upward
  scroll, without resizing the scroll area. Hidden navigation is inert. The cart
  badge uses a warm colour and white count; subtle badge bounce and icon rotation
  respect reduced-motion preferences.

## Source and regeneration

The reviewed CSS snapshot is `apps/storefront/src/components/yasminat/approved/mobile-review.css`.
Run `node scripts/design/port-mobile-review-css.cjs` to regenerate its scoped
`approved-mobile-review.css`. Frame adaptations keep native pages independent of
the prototype board captions. Native links use `data-nav` for cart styling.

Order tracking reuses authenticated order-group retrieval and existing fulfillment
status components. No prototype SMS simulation, sample orders or fake delivery
updates are wired into the live commerce flow. Real checkout fields remain.

## Validation

- Strict storefront TypeScript and optimized Next release build passed.
- Local release uses only the loopback in-memory QA fixture, not production data.
- Large/sand variant at quantity two reached the backend cart at QAR 400;
  decrement changed the total to QAR 200; removing the test item emptied the cart.
- Checkout renders its existing address/payment controls and a full-width progress
  row. No payment or order was submitted.
- Mobile header/footer visibility checked for favourites, account, login,
  registration and unauthenticated order routes. Protected order pages redirect
  to login. Authenticated orders and physical-phone behaviour require review
  with an actual customer; no customer account was created for this release.
- Multi-image thumbnail selection and RTL keyboard navigation were checked using
  a temporary local gallery harness, which was removed. Existing preview products
  currently have one image each; the gallery uses additional real images when
  supplied through the catalogue.
- Read-only production inventory before publishing: 20 products, 250 categories,
  7 sellers, 30 offers, 0 orders and 0 customers. No seed or cleanup runs as part
  of this UI release. Prior seed fixes are retained for reproducible future use.

## Category pagination correction

The production browser showed only the old Plants category because the first
100 of 250 categories omitted the preview batch. Default category loading now
collects every API page, while explicit bounded/offset queries keep their scope.
The 237 legacy categories remain unchanged in the backend. Tests cover a batch
of 13 preview categories after 237 legacy entries, explicit query bounds and
later-page failures.

Publication and public URL checks are recorded after deployment.

## Standalone exits

The header-free mobile product page now overlays a white 44px circular back
control when browser history is available. Login and registration use the same
history-aware back control; direct entries instead get a close link to the
localized home page. The close link works before client hydration. These controls
add no header strip or footer, preserve the gallery position, and mirror the back
arrow for Arabic and English. Verified local navigation with and without history,
including returning from registration to login and closing a direct login entry.
