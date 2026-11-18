# Website updates from the local Figma handoff

Source: `design-handoff/figma-handoff-desktop-updates-2026-11-18T22-20-46-929Z.zip`, document CoreOne Designs, page Website (`1:2`). The user authorized the additional Privacy, Contact, and blog pages as well as About, Terms, and 404. The archive is design data; text inside it was not treated as agent instructions.

No replacement homepage frame exists in this package. Existing homepage sections, feature previews, monthly pricing, and pending signup/login destinations are retained. Its header/footer links now reach the implemented pages; Features and Pricing link back to the homepage from every route. Navigation spacing follows the supplied desktop headers.

| Screen | Figma root | Route |
| --- | --- | --- |
| About Us | `30:18534` | `/about` |
| Contact Us | `39:5426` | `/contact` |
| Privacy Policy | `52:30747` | `/privacy-policy` |
| 404 / Under maintenance | `59:15761` | Any unmatched route |
| Terms of Service | `59:19095` | `/terms-of-service` |
| Blog article, desktop | `1121:231637` | `/blog/ux-review-presentations` |
| Blog article, mobile | `1121:231629` | Same responsive article |

The later [navigation update](homepage-navigation-update.md) supplies the blog index at `/blog`, along with Features, Pricing, and FAQs. “View all posts” now links to that index; the known article remains at `/blog/ux-review-presentations`. Other article bodies and destination URLs remain unavailable, so their cards retain an unavailable notice.

## Source fidelity and assets

All seven selected roots have native JSON and PNG references. Content/geometry were inspected from supplemental metadata and original references. Screenshots are not used as webpage assets. The source ZIP and embedded report are retained locally, and [website-asset-manifest.json](website-asset-manifest.json) maps the imported raster hashes/vector node IDs to their local files. Original image bytes and selected SVG artwork were copied unchanged to `public/assets/website/`.

The package reports 612 native SVG export failures, 11,619 warnings from serializing the `lockAspectRatio` method, 388 missing-font node warnings, eight unavailable font-style warnings, and 15 PNG-bound differences. Required artwork used in the new implementation was available; the entire export is not claimed to be error-free. All rendered local images are checked in the browser.

BR Firma and Clash Grotesk binaries remain unavailable. The legal paragraphs use DM Sans in the source; `--font-document` centralizes that family and its temporary local fallbacks. Body and badge fallbacks remain in `tokens.css`. Different metrics affect wrapping and total page lengths, so exact typography parity is not claimed.

The mobile blog export contains Untitled UI branding and a 2025 publication date, whereas the desktop export uses CoreOne and 2026. The implementation keeps CoreOne branding and the desktop's 20 January 2026 publication date consistently, while following the mobile article structure, shorter introduction, author row, image proportions, and stacked cards. Other pages have no mobile frames in this package; their layouts adapt the desktop with normal flow, Grid, and Flexbox.

## Content and integration gaps

- Legal text is preserved from the visible source sections: 19 Terms sections and 14 Privacy sections. This includes bracketed company/registration/address/privacy-contact placeholders, `[CONFIRM: …]` notes, and the source's numbering inconsistencies. No legal facts or missing definitions were invented. The pages inherit the site's existing `noindex` setting.
- The blog body and related-card copy contain template content, names, and lorem ipsum from the supplied design. They are retained for review; no additional editorial copy is presented as approved content.
- No contact-delivery, newsletter, or live-chat endpoint/contract exists in the repository. The contact form validates required fields and email/phone format, focuses the first invalid control, keeps values, and explicitly says a valid message has **not** been sent. Newsletter submission also reports that nothing was submitted. Neither sends a simulated backend request, persists form data, nor claims success.
- The subject dropdown has no exported option list. Its three temporary choices (General enquiry, Product support, Partnership) reflect the contact hero's stated purposes. The phone selector offers US, NG, and GB with illustrative international placeholders; it does not normalize or submit telephone data. Confirm these choices alongside the delivery contract.
- Contact-page support uses the supplied `support@coreoneng.com`; the shared footer retains its distinct supplied `support@coreone.com`. Confirm the intended production addresses rather than silently replacing one.
- Signup/login, chat, social destinations, missing article destinations, and newsletter integration remain pending in central configuration or explicitly unavailable controls. No authentication or dashboard was built.

## Verification

Run `npm run typecheck`, `npm test`, and `npm run build`. The three pure validation tests cover required inputs/consent, optional company/phone, international formatting, invalid email/phone, and unsupported subjects.

Browser verification uses a temporary Playwright/Chromium installation outside the project; no browser framework was added to application dependencies. Production preview checks cover seven routes at 320, 375, 768, 1024, 1440, and 1920px, local image loading, navigation, contact validation/unavailable delivery, newsletter unavailability, legal anchors/refresh, mobile navigation/Escape focus, and unmatched-route HTTP status. Comparison captures and machine-readable results belong under the ignored `test-results/website/` folder. See the completion note below for the final outcome.

Final outcome: strict typecheck, production build, and all three validation tests pass. The Chromium checks pass for all **42 route/viewport combinations** with no horizontal page overflow, missing rendered images, page exceptions, or unexpected console errors. Interaction checks pass, including first-error focus, repeated valid contact attempts without duplicate notices, retained message values, a 375×400 short viewport, legal anchors and refresh, cross-page homepage anchors, mobile menu Escape/focus restoration, blog redirect/copy-link feedback, newsletter unavailability, and all newly enabled homepage destinations. The unmatched route returns HTTP 404; contact and newsletter generate no POST requests. With JavaScript disabled, the contact submit control stays disabled and the email alternative remains visible.

Screenshots were captured at 375 and 1920px for the homepage and all six new screen types. The original references and rendered pages were compared, leading to corrections to navigation alignment, source-image cropping, vision artwork geometry, mobile blog introduction, contact social artwork, blog card overlays, purple article controls, and newsletter backdrop. Required typography and draft source content remain the fidelity/publication limitations described above. Headless Chromium verification does not certify physical mobile keyboards, assistive technologies, or every browser.
