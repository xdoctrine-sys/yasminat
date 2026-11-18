# Yasminat floating mascot scenes — frontend release

Based on c60e040ad3900696cc08c4d59283fd1a14d199f6. Native Next.js integration of the approved existing design-page scenes. Only the Yasminat storefront service is targeted.

## Implemented inventory

- Persistent compact launcher in the language-appropriate bottom corner of the existing page frame.
- Original supplied transparent robot, frozen and clipped into its original parts without asset or colour changes. Jump/separate/reassemble, blink/wink, camera with three flashes, watering-can/plant/water scene, and gift thinking/retrieval/presentation/tidy scene.
- One silent animation director; sequential scenes and idle gaps, deterministic prop/arm cleanup, per-session quiet control, reduced-motion assembled fallback, background-tab suspension, introduction/media/modal locks, and lifecycle cleanup on route/language changes.
- Stable corner anchoring based on layout dimensions, independent of scrolling or tab-bar transforms. Scrolling disables mascot pointer interception; after settling, a single control-overlap read batch allows click-through. No scroll-time candidate positioning loop.
- Existing inline introduction remains in place with a static small-format symbol. Dock opens the same native audio/transcript/video card, retains the under-development disclosure, coordinates audio handoff and uses unique nested-video dialog IDs.
- Cart, checkout and authentication screens use the small quiet launcher. No commerce, provider, authentication, payment, upload, order, API, database or backend logic changed.

The latest palette evaluation was advice only and is excluded. Existing palette and layouts are retained. No new AI/photo-processing service is enabled.

## Preserved content

Arabic ElevenLabs v4, English neural v3, both transcripts, four presentation videos, original mascot artwork and logos are byte-identical to the base release. No automatic audio. Explicit play/pause/resume and narration-ended-to-video handoff retained.

## Validation and limits

Production-mode Next.js build with type checking. Browser checks cover Arabic/English phone, tablet and desktop viewports; scene poses and natural cleanup; slow/fast scrolling; quiet, reduced motion, real background-tab suspension, modal handoff; audio/video controls; and local in-memory commerce regression. Published checks and screenshots are recorded outside the source tree in `docs/integration-qa/mascot-scenes-release` in the Yasminat workspace.

Responsive checks use browser viewports, not a physical phone. No measured FPS claim and no real order/payment submitted.

## Recovery

Previous production frontend source: c60e040ad3900696cc08c4d59283fd1a14d199f6 on codex/yasminat-botanical-colors. Previous successful deployment: 3a38a9aa-e63e-48dc-a10f-5c2ffc470242. Recovery can redeploy that build or reconnect only the storefront service to that source. Backend service remains on deploy/e867a25 and is outside this release.
