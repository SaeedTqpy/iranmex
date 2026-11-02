# Venue delivery gate

2026-11-01. Scope: the redesigned homepage venue component and its new asset. The rest of the existing homepage is not an accessibility audit target.

## Pages publication

- Built an isolated static export with `PAGES_BASE_PATH=/iranmex npm run build:pages`; all 23 static routes generated successfully.
- Published to `SaeedTqpy/iranmex`, branch `main`, commit `e276c9ef28231336a5bee164b88c95c80851ea4c`.
- Public homepage response contains `/iranmex/venue/parsian-enghelab.webp` and the verified Neshan destination.
- Public photograph URL returns HTTP 200 with `content-type: image/webp`.
- Deployment run completed successfully: https://github.com/SaeedTqpy/iranmex/actions/runs/41345526094

## Observed checks

- Production: `npm run build` passed after the final source edits, compiling all 28 generated pages.
- Desktop: visually reviewed at 1280px; screenshot at `output/previews/venue-desktop.png`.
- Responsive: rendered at actual browser widths 320, 390, 768, 1024 and 1280px. DOM rectangle checks found no venue children outside the viewport. The 320px and 768px layouts were also visually inspected.
- Copy: clicked on desktop and mobile; button changed to `آدرس کپی شد` and the live status reported success. The clipboard-denied fallback is code-inspected, not browser-injected or claimed as a clicked test.
- Neshan: Tab moved from copy to the route link, with `:focus-visible` and a solid outline. Enter opened the actual Parsian Enghelab hotel page in a new tab.
- Google Maps: clicked; the resulting page title was `Parsian Enghelab Hotel - Google Maps`, centered at 35.7072655, 51.4084505.
- Photograph source: clicked; opened the same verified Neshan hotel page.
- Browser logs: no warnings or errors returned during local checks.
- Photograph: loaded successfully with natural width 1440; WebP asset is approximately 356KB and has explicit 1440 × 959 dimensions.
- Contrast: text on the lightest section base #102e32 measured 9.18:1 (#bdd3d0), 10.08:1 (#c8dcda), 13.01:1 (#edf5f5). Primary button measured 11.39:1 (#102630 on #a9f11d). Caption uses the darkened lower image region.
- Existing page observation: an unrelated animated program image can extend the overall document about 5px beyond the mobile viewport while pending reveal. The venue has zero horizontal overflow; that existing section was not changed.

## Hard gate

- R-02 PASS: new interface copy contains no em dash.
- R-03 PASS: venue rectangles fit at each tested width; 320px screenshot shows both map buttons and the schedule contained.
- R-17 PASS: dates and hours come from the existing event information; no statistics were added.
- R-18 PASS: no testimonials were added.
- R-23 PASS: user explicitly authorized redesign and obtaining imagery; real venue was confirmed before implementation.
- R-24 PASS: no navigation structure was changed; all added links resolve to tested external destinations.
- R-25 PASS: measured text and button contrast exceeds AA; caption sits over a dark lower overlay.
- R-26 PASS: copy, Neshan, Google Maps and photo attribution were individually clicked with observed effects.
- R-27 PASS: copy has idle, success and explicit error states; image dimensions reserve loading space and alt text identifies the location.
- R-28 PASS: no FAQ was introduced.
- R-32 PASS: native controls, Tab focus outline and Enter navigation were observed.
- R-33 PASS: JSX and scoped CSS were edited through source patches; Sharp only converted the photographic asset.
- R-34 PASS: the component follows the existing single dark theme; no theme toggle was introduced.
- R-35 PASS: production build, visual rendering, console inspection and individual control checks are recorded above.
- R-36 PASS: no unsupported security, commercial or customer claims were added.
- R-37 PASS: supplied screenshot and existing brand informed the declared direction before editing; rationale is recorded in `venue-design.md`.
- R-38 PASS: real exterior and verified venue replace neither the location nor the event schedule with fabricated content.
- R-39 PASS: semantic address, figure, caption and description list; named native links and button; visible focus; 44px minimum copy and credit controls; reduced-motion rule.
- R-40 PASS: explicit media dimensions, lazy below-fold loading, no embedded map SDK, and a small isolated clipboard client component.

## Purpose gate

- R-01 PASS: existing petrol section background retained; image gradient provides caption contrast.
- R-04 PASS: existing Lucide icons identify location, navigation, date, time, copy and external navigation.
- R-06 PASS: existing Peyda font preserves Persian brand typography; name, address and schedule have different hierarchy.
- R-07 PASS: no new decorative background pattern.
- R-08 PASS: navigation and external-link icons communicate action rather than decorating every control.
- R-09 PASS: no new capsule badges.
- R-10 PASS: no new translucent UI panels.
- R-12 PASS: no new floating shadows.
- R-13 PASS: no new glow effects.
- R-14 PASS: photo and information have different roles; no equal-card repetition.
- R-19 PASS: only brief action color transitions; reduced motion disables them.
- R-22 PASS: the photograph is the confirmed real building, with visible source attribution.

## Liveliness

- Dials PASS: ENERGY 2 / RHYTHM 2 / MOTION 1 declared before implementation.
- Composition PASS: asymmetric photo and information replace the repeated cards; mobile reorders into a single column through normal document flow.
- Focal point PASS: exterior photograph and prominent venue name identify the destination.
- Whitespace PASS: gaps separate identity, routing and schedule; the schedule divider encodes a content change.
- Accent PASS: lime emphasizes primary routing and the existing heading motif.
- Identity PASS: established petrol, lime, Peyda and RTL language remain visible.
- Design read PASS: rationale was stated before generation and persisted in `venue-design.md`.

## Craftsmanship and consistency

- C-1 PASS: major choices have specific purposes in `venue-design.md`.
- C-2 PASS: every introduced control has a verified real action.
- C-3 PASS: only venue identification, arrival planning and existing event schedule were added or reorganized.
- C-4 PASS: tested breakpoints fit; native keyboard interaction works; clipboard error path is explicit and code-inspected.
- C-5 PASS: venue identity was user-confirmed and independently mapped; exterior is real.
- R-05 PASS: content determines composition; the existing introduction video remains below the venue.
- R-11 PASS: 14px photo corners and 8px action corners express different roles.
- R-15 PASS: action labels name copying or the actual map provider.
- R-16 PASS: interface copy states location and actions without marketing filler.
- R-20 PASS: real entrance, named Tehran streets and existing event typography anchor the section to this event.
- R-21 PASS: dark colors come from the supplied site direction.
- R-29 PASS: existing petrol, off-white and lime palette; no unrelated accent family was added.
- R-30 PASS: no external product layout or identity was copied.
- R-31 PASS: color, composition, imagery, type, spacing and motion rationales are recorded.
