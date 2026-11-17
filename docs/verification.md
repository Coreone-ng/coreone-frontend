# Verification

Verified on 17 November 2026.

## Automated checks

- `npm run typecheck`: passed with strict TypeScript.
- `npm run build`: passed; the homepage is statically prerendered.
- Local homepage HTTP response: 200.
- Asset audit: all 234 original and supplied-export manifest entries exist, are non-empty, and match their recorded byte counts. The two named brand copies also exist.
- No temporary Figma asset URLs occur in application source.
- Initial dependency installation reported zero known vulnerabilities.

There was no existing test or lint suite in the empty repository. No additional test framework was installed.

## Browser verification

Chrome was used for the initial desktop inspection. Its browser connector was unavailable and native observations stopped working after opening developer tools. Verification continued in Safari using its native UI. A temporary local harness rendered the actual homepage in same-origin iframes at exact CSS viewport widths and reported DOM measurements; the harness is removed from the delivered application.

| Viewport width | Horizontal page overflow | Broken images observed |
| -------------- | ------------------------ | ---------------------- |
| 320px          | None                     | None                   |
| 375px          | None                     | None                   |
| 768px          | None                     | None                   |
| 1024px         | None                     | None                   |
| 1440px         | None                     | None                   |
| 1920px         | None                     | None                   |

Safari reserves 17px for its scrollbar in these iframes. Measurements used `window.innerWidth` for the requested width and `documentElement.scrollWidth` for overflow. This exercises actual responsive layouts rather than scaling a desktop layout down to mobile. The harness also confirmed one h1, no duplicate IDs, and no captured JavaScript errors during the interactions checked.

All eight sections were visually compared with the Figma screenshots at desktop width. Mobile inspection covered the hero, stacked feature selector and imagery, compliance, the two-column security photo grid, pricing including the long Business price, testimonial fan, stacked CTA, and both parts of the footer. Original image crops, layered devices, logo variants, decorative patterns, QR artwork, and local asset loading were inspected. The final production build was checked after development-mode checks.

Interactions exercised:

- “See How It Works” scrolls to product features.
- Mobile navigation expands, closes on selection, and closes with Escape after returning focus to its toggle.
- Feature selection updates copy and the matching mockups. All six tabs use supplied content and their corresponding desktop/mobile mockups. Expenses and Reports were completed from the user-provided SVG exports. Arrow-key selection was exercised. Home/End handling is implemented in the same keyboard handler.
- Signup/login actions open a native unavailable notice. Mobile menu notices render through a portal outside the collapsed menu. Escape and Close dismiss dialogs; native modal focus behavior is retained.
- Monthly pricing shows the source values and annual billing is disabled.

Issues fixed during inspection: a CTA decorative-layer offset and stacking order, fragile absolute placement of selected feature copy, a compressed mobile QR badge, mobile menu/dialog focus behavior, duplicate dialog IDs, footer social labels, and Business-price text overflow caused by fallback font metrics. Price sizing now respects the available card width.

The initial Chrome session produced a hydration warning because an installed extension injected `crxlauncher` attributes into the document. This was external to the page and was not suppressed in application code. The clean Safari production checks did not report that warning.

This is a desktop-browser responsive verification, not a physical-device or cross-browser certification. Exact typography parity remains limited by the missing licensed fonts, and external integrations remain pending. See `design-reference.md` for exact nodes and integration gaps.

## Reports and Expenses export update

Completed both formerly unavailable feature previews from the user-supplied Desktop - 3 SVG exports. All four extracted PNGs were compared byte for byte with their embedded source data. Both selected-state icons retain the original export paths. Crop percentages and offsets are derived from the SVG pattern matrices rather than estimated from a screenshot.

The updated production build and strict type check pass. Safari inspection at 1920px, 375px, and 320px confirmed the corresponding mockups load, the longer Expenses copy stays in normal flow, and the page has no horizontal overflow. Native tab clicks and arrow-key switching from Expenses to Reports update the description, selected state, and image pair. The temporary verification page was removed after checking the two previews.
