# Mobile performance — October 2026

This repository contains the published static export, not the editable React source.
The home page selects a lightweight DOM controller at initial widths up to 900px.
The selection runs after the viewport meta tag and also recognizes mobile user agents,
so Android browsers cannot select desktop based on their initial 980px layout viewport.
Larger initial widths import the existing desktop runtime unchanged.

## Changes

- Gate desktop JS imports and remove unconditional module preloads on the home page.
- Restrict sprite and font preloads to desktop widths.
- Use system fonts and only the walking sprite on mobile.
- Remove particle, forest, cloud and foreground layers from the mobile DOM.
- Update the capybara and progress using transforms in one frame per scroll event.
- Change headings and seasons only when crossing a phase boundary; remove blur effects.
- Pause walking when scrolling stops, the hero leaves the viewport, or the tab is hidden.
- Respect reduced motion and keep all four phases and form submission destinations.
- Reduce the mobile journey from 840vh to 440svh.

The initial device mode is retained after viewport resize. Do not hydrate the mobile DOM
with the desktop runtime after it has been simplified. Desktop behavior is unchanged.

## Verification

Run `node tools/verify-mobile.cjs` with Playwright available via NODE_PATH and Microsoft
Edge installed. All form destinations are intercepted; no test leads are submitted.
Checks cover mobile browser contexts at 390px and 768px, desktop at 1280px, phase progression, resource loading, overflow,
form success/failure and reduced motion. A local comparison with the committed export
measured decoded resource bodies at 1,062,323 bytes before and 429,489 bytes after,
with scene descendants reduced from 173 to 6. These are local load measurements,
not field Core Web Vitals or an FPS guarantee on physical devices.

## Incremental scenery test

Version v3 adds two static CSS trees at the sides, using the existing seasonal colors
and snow caps in winter. This adds two DOM elements and no image requests or ongoing
animations. Local decoded resource bodies increased from 429,515 to 430,781 bytes.
Mobile scene descendants are now 8; desktop remains 173. Physical-device smoothness
is being checked on the user's Samsung A15 before adding more scenery.

Version v4 tests 6 snowflakes and 7 rain streaks, with only the current season visible.
Transform-only CSS animations pause outside the hero or when the document is hidden.
Reduced motion disables both layers. No particle images are fetched. Decoded resource
bodies are now 432,699 bytes, about 1.9KB above v3; scene descendants total 23, with at
most 7 moving weather particles. Device performance remains subject to the A15 test.

Version v5 adds one static CSS celestial disc: a moon with two simple craters in
winter/autumn, a sun in spring/summer. It sits above the text, below the header.
No new images or animations are introduced. Decoded resource bodies are now 433,814
bytes, about 1.1KB above v4; mobile scene descendants total 24.

Version v6 moves the capybara from one full sprite width outside the left edge to
the viewport's right edge. It crosses the center at 50% journey progress and is
fully outside the viewport at both endpoints. Resize remeasures the route. No new
images or elements are added. Verification checks both endpoints and midpoint.

Version v7 restores the existing four-phase rail on mobile as a compact horizontal
strip above the progress prompt. The active phase has a teal underline and aria-current.
The sprite is raised 18px to keep its path above the strip. No new elements or images
are added; decoded resource bodies total 435,150 bytes, about 1.3KB above v6.

Desktop route v1 applies a separate CSS keyframe only outside mobile mode. The route
runs continuously from outside the left edge to outside the right edge, rather than
pausing in the center between 30% and 70%. Existing desktop sprite state transitions
and scenery remain controlled by the original runtime. Endpoint and midpoint geometry
are checked in the desktop browser test with scroll anchoring disabled for measurement.

Run `node tools/preview.cjs` to preview at http://127.0.0.1:4173.

If regenerating the static export, retain the conditional loader in index.html,
the desktop-only preload media queries, assets/mobile-lite-v7.{js,css}, and
assets/desktop-route-v1.css.
The older source in ../../08_Site does not include these static-export changes.
