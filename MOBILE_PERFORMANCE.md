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

Run `node tools/preview.cjs` to preview at http://127.0.0.1:4173.

If regenerating the static export, retain the conditional loader in index.html,
the desktop-only preload media queries, and assets/mobile-lite-v2.{js,css}.
The older source in ../../08_Site does not include these static-export changes.
