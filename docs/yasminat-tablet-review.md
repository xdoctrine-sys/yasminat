# Tablet review and fragrance branch

The approved tablet review is now implemented in the native Mercur storefront.
At 651–1023px it uses compact page controls and an inline home search, hides the
Qatar location/menu, retains the 190px category sidebar, three product columns
from 720px, and split product/cart layouts. Mobile and desktop keep their own
breakpoint rules. Review styles are regenerated with
`node scripts/design/port-mobile-review-css.cjs`.

`src/app/storefront.css` keeps base styles and review overrides in one import
chain. Separate JS imports were reordered in the optimized build, shrinking the
native frame to the prototype's default 390px. The built application was checked
after consolidating the cascade.

The category tree retains real descendants of the visible preview roots without
exposing or deleting the unrelated legacy catalogue. Home filters, department
navigation, parent category pages and direct child links include the new branch.

## Catalogue operation

`scripts/deploy/add-home-fragrance-category.ts` defaults to a read-only plan.
It requires the unique existing Yasminat decor parent, refuses duplicate matches
or automatic reassignment, and creates only one active, empty category through
Medusa's category workflow. The category is not tagged as disposable preview data.
It creates no products, offers, prices, inventory, customers or orders.

Apply only to the already-authorized production project:

```sh
python3 scripts/deploy/run-remote-script.py scripts/deploy/add-home-fragrance-category.ts
python3 scripts/deploy/run-remote-script.py scripts/deploy/add-home-fragrance-category.ts --apply
```

Before apply, the catalogue had 20 products, 250 categories, 7 sellers, 30 offers,
0 orders and 0 customers. No exact matching diffuser category existed. The legacy
generic Home Fragrance category under Anniversary remains unchanged.

## Validation

- Optimized Next.js build with strict type checking passed.
- Six category pagination/tree tests passed, including preservation of legacy
  records, real descendants of preview roots, normal trees and language labels.
- Built local app checked at 390, 768 and 1024px without horizontal page overflow
  on home, departments, product, cart, child category and account.
- At 768px: home header 68px/search 40px, sidebar 190px, department product grid
  3 × 162px, product columns 2 × 347.5px; cart columns 458px/240px.
- Local contract fixture: large/sand variant and quantity 2 reached the cart with
  400 QAR total. No payment or order submitted.
- Parent/child navigation and zero-product state checked; decor still lists its
  existing five fixture products. English branch labels checked through the UI.

Production deployment IDs and public checks are recorded separately in the
workspace release receipt after deployment completes.
