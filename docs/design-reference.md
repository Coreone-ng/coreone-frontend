# Design reference

Source: [CoreOne Designs, homepage 26:3721](https://www.figma.com/design/2qQKG9o2XCMMP5HOofN8Hs/CoreOne-Designs?node-id=26-3721), page Website (`1:2`), 1920px desktop frame.

Detailed design context and screenshots were obtained for each section before implementation. The sparse full-frame response was not used as implementation detail.

| Section                      | Figma node    |
| ---------------------------- | ------------- |
| Header and hero              | `5:10`        |
| Product features             | `1114:214981` |
| Tax and compliance           | `26:891`      |
| Data protection and security | `25:784`      |
| Pricing                      | `1121:229172` |
| Testimonials                 | `41:7484`     |
| Final CTA                    | `26:1726`     |
| Footer                       | `50:2839`     |

The feature component set is `1110:211619`. Detailed responses were obtained for Banking (`1110:211618`), Invoicing (`1110:211620`), Teams & Roles (`1110:212055`, via the homepage instance), and Tax (`1110:212200`). The homepage defaults to Teams & Roles, matching the supplied frame.

## Fidelity limitations and pending inputs

- Expenses (`1110:211765`) and Reports (`1110:211910`) were completed from user-supplied Desktop - 3 SVG exports on 17 November 2026 after the MCP tool limit blocked direct inspection. Their original embedded PNGs are decoded into `public/assets/home/expenses` and `public/assets/home/reports`; the selected icon paths are preserved in standalone SVGs. Feature copy is transcribed from the rendered exports. Image crop heights and offsets follow each export’s pattern matrix; Reports also preserves its 64px desktop-mockup inset. The full section exports are visual references, not flattened webpage assets.
- The same limit prevented inspecting possible mobile designs, annual pricing candidates, and the separate trademark frame `417:17`. Mobile layouts adapt the verified desktop composition. The original header/footer logo assets were obtained from their actual homepage instances.
- No BR Firma or Clash Grotesk files were present in the empty repository or supplied attachments. Their temporary fallbacks are centrally configured in `tokens.css`. Different font metrics affect line breaks and density; exact typography parity is not claimed. The desktop hero supporting-copy width is tuned for the fallback.
- The design's testimonial cards contain gray rectangles, not usable customer photos or video sources. The five-card composition is preserved. Playback remains unavailable and opens an honest notice.
- Annual billing is disabled. Monthly prices are exactly ₦4,500, ₦7,000, and ₦10,000. No annual multiplier or discount is assumed.
- Signup/login, social destinations, and compliance/security detail destinations remain null in central configuration. About, Contact, Terms, Privacy, and the supplied blog article now have local routes from the subsequent [website handoff](website-updates.md). The supplied phone number and email are retained. “See How It Works” scrolls to `#features`, per the user's follow-up.
- Obvious button typos in the source, “Lear More” and “Start Fee Trial,” are rendered as “Learn More” and “Start Free Trial.” Prices and entitlements are preserved.
- The footer SVGs visually represent X, Facebook, Instagram, and LinkedIn. Their accessible labels follow the actual artwork, correcting stale layer labels in the returned metadata.

## Assets and tokens

All returned SVG and PNG assets were downloaded locally. No expiring Figma asset URL appears in application code. The [asset manifest](asset-manifest.json) records source node IDs, names, original dimensions, byte counts, and paths. `public/assets/brand` provides named copies of the original light/dark wordmarks. The homepage never uses a section screenshot as a webpage asset.

Core tokens: hero `#F5FEFF`, cyan sections `#ECFDFF`, primary teal `#1BB7AC`, ink `#0A132B`, and dark green `#0A2A29`. The principal desktop container is 1216px; section-specific dimensions follow the inspected frames. Absolute coordinates are limited to overlapping devices and decorative artwork.

Guidance read and applied alongside the Figma design-to-code workflow: [frontend-ui-engineering](https://www.ui-skills.com/skills/addyosmani/frontend-ui-engineering), [better-ui](https://www.ui-skills.com/skills/jakubkrehel/better-ui), and [visual-edit-precision](https://www.ui-skills.com/skills/wshobson/visual-edit-precision). The supplied design takes precedence over their optional aesthetic recommendations.
