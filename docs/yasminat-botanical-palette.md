# Yasminat botanical palette

The user selected the warm botanical palette and authorized publishing the
colours to the existing storefront. The comparison switch stays exclusively
in the separate design prototype.

`src/app/yasminat-palette.css` defines storefront colour tokens and adapts the
existing approved components. It is the last stylesheet in the existing
`storefront.css` chain. Native commerce forms inherit the existing semantic
Tailwind tokens. Only colour-related declarations change; assets, dimensions,
content, routes, authentication, cart and checkout implementations stay intact.
No prototype scripts, review controls, mascot, audio or new video assets are
included in this release.

Palette: cream `#FAF7F0`, forest `#244638`, secondary text `#435648`, sage
`#E7EFE5`, sand `#F1ECE2`, terracotta `#C26D4A`, soft terracotta `#F8ECE6` and
strong terracotta `#A64E2E` for small white badge numbers. Existing photo/SVG
backgrounds remain embedded in their original assets.

The deployed storefront service serves yasminat.com, www.yasminat.com and the
existing hamadstores.com alias. No separate tenant branding is selected by host
in this application. The other Railway projects are outside this change.

Deploy the storefront service only. Both services track the `deploy` branch,
so pushing this change there would also trigger the backend. The storefront follows the isolated, clean committed colour-release branch;
the backend keeps following `deploy`. This lets GitHub deploy only the storefront
and keeps later backend pushes from silently reverting its palette. Backend,
dashboards and data are untouched. Future integration between deployment
branches should be reviewed deliberately.
Detailed build, responsive and public verification evidence is retained in the
workspace release report outside this repository.

## Approved mascot release

The frontend branch also includes the approved Yasminat introduction card, original transparent artwork, AR/EN v3 narration and concept videos. These are native React components, not a prototype iframe. Audio loads only after a user click. The transcript and video explicitly describe a service in development; no AI, photo upload, account or paid provider integration is enabled. Reduced motion shows the static drawing.

This branch is the storefront release source only. Its root `railway.json` builds and starts only `apps/storefront` and has an empty pre-deploy command list. Do not apply this frontend manifest to the backend source branch (`deploy`). The backend service and data remain on that branch unchanged. The legacy config is retained for this existing Railway service; a broader IaC migration is outside this UI release.
