# Features, Pricing, FAQs and blog index

Source: `design-handoff/figma-handoff-2026-11-18T22-59-07-958Z.zip`, CoreOne Designs, Website (`1:2`). The archive passed its integrity check and its embedded report is retained as `design-handoff/home-update-report.json`. Attached design text was treated as data, not execution instructions.

| Source frame | Figma root | Route |
| --- | --- | --- |
| Features | `29:6248` | `/features` |
| Pricing | `30:6249` | `/pricing` |
| Frequently Asked Questions | `36:1064` | `/faqs` |
| Blog index | `1121:226925` | `/blog` |

The homepage header and footer now link to these pages. The homepage's existing six device-preview tabs remain intact: this package provides the full Features catalogue, not replacement homepage tab mockups. Homepage “See How It Works” still scrolls to its own feature section; the equivalent catalogue control scrolls to the catalogue while no video is available. The article remains at `/blog/ux-review-presentations`, and its “View all posts” link reaches the supplied index.

## Implementation

- Features contains all twelve exported categories, source copy, card icons, and the roadmap's Coming Soon label. Its anchor navigation works with direct hash visits, refresh, and normal scrolling. It is navigation through visible sections, not a set of hidden tab panels.
- Pricing reuses the homepage's existing card component and data. The new export confirms monthly Starter ₦4,500, Growth ₦7,000, and Business ₦10,000 and the same entitlements. No annual prices were supplied; annual billing stays disabled. The “Start Fee Trial” source typo keeps the existing corrected “Start Free Trial” wording.
- FAQs support search across question/answer words, case-insensitive matching, result counts, empty results, and keyboard-operable expand/collapse buttons. The first answer is the actual exported text. **The other six answers are lorem ipsum, explicitly requested by the user for unavailable text.** They are marked `placeholder: true` in the local data and need approved replacements before publication.
- The shared FAQ section also appears beneath pricing. Both pages use the exported Still deciding / Talk To CoreOne closing composition, reusing the existing original artwork and byte-identical phone asset. That CTA reaches `/contact`.
- The blog index preserves all nine supplied cards, their original images, category badge colors, and source dates. Only the UX review article has a supplied destination/body. Other article cards explain their unavailable state. Page 1 is current; unprovided pages and Next/Previous stay disabled instead of generating fake pagination results.
- The blog-index newsletter form reuses the existing explicit unavailable-submission behavior, with its supplied brand color and Submit label. The article's existing purple controls remain unchanged. No email submission is simulated.

## Assets and known source gaps

The native JSON, supplemental properties, and PNG references were inspected locally. No additional Figma MCP calls or Figma document writes were needed. [The asset manifest](website-asset-manifest.json) records original raster hashes, SVG node IDs, and local filenames; source assets are copied unchanged and reused when the bytes match.

The FAQ question-mark image has saturation `-1` in its source paint, reproduced with a grayscale display filter. Its original image file remains untouched. Catalogue section typography/spacing and FAQ plus/minus/search icons follow the exported metadata/artwork.

The export reports 98 SVG failures, 7,617 warnings from attempted serialization of the `lockAspectRatio` method, 382 missing-font node warnings, and six unavailable font-style warnings. The required visible artwork used by these pages was available. BR Firma / Clash Grotesk binaries remain missing, and temporary typography fallbacks remain centralized in `src/styles/tokens.css`; exact typography parity is not claimed. Mobile layouts adapt the desktop frames because this package contains no mobile frame.

The source Audit Trail description ends mid-sentence (“See who did what, and when, for every material change to ”), and the AR/AP Ageing description repeats its heading. Those source strings are retained rather than completed with invented business copy. Blog card dates mix 2025 and 2026 in the export and are preserved as supplied.

Signup/login, annual pricing, newsletter delivery, unpublished article bodies, and additional blog pages remain pending. The existing site-wide `noindex` remains enabled. The earlier onboarding package still lacks its signup/setup entry screens; these website updates do not introduce authentication.

## Verification

`npm run typecheck`, `npm test`, and `npm run build` check the application. Seven targeted unit tests cover contact validation and FAQ matching, blank searches, whitespace/case handling, answer matching, no-result cases, and the six requested placeholder answers.

Browser captures and results are stored under the ignored `test-results/home-updates/` directory. Checks cover six routes at 320, 375, 768, 1024, 1440, and 1920px; all original desktop frames are 1920px wide. Interaction coverage includes homepage destinations and preview tabs, catalogue anchors/refresh, monthly prices and disabled annual billing, FAQ search/keyboard/empty states, mobile menu focus, all nine blog cards, unavailable pagination/posts, newsletter unavailability, article/index links, and the custom HTTP 404 response. Final results are recorded below after the visual refinements.

Final verification on 19 November 2026: strict typecheck, production build, and all seven unit tests pass. All **36 route/viewport checks** and the listed Chromium interaction checks pass. There are no horizontal page overflows, missing rendered images, page exceptions, unexpected console errors, or simulated POST submissions. The twelve catalogue anchors are unique and all 59 imported website assets are present and non-empty. Comparison captures are available at 375px and the original 1920px width, with machine-readable results in `test-results/home-updates/verification.json`. This is headless desktop-browser responsive verification, not physical-device or assistive-technology certification.
