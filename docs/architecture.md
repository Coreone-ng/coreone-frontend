# Architecture

`src/app/page.tsx` composes the homepage and owns no interaction state. The header is a banner landmark, all homepage sections are inside the main landmark, and the footer is a content-info landmark. The layout owns metadata, language, global styles, and the skip link.

`src/components/ui` contains the reusable container, section-heading/eyebrow, and action primitives. `src/components/layout` contains site navigation and footer. Each component owns a CSS Module. Colors, fonts, common spacing, radii, and shadows are shared through CSS custom properties in `src/styles/tokens.css`.

`src/features/home/components` contains independent section components. `src/features/home/data` contains typed feature states, plan entitlements, and source image dimensions. Navigation and external destination configuration are separate from page content in `src/config`.

Server Components render the page, sections, pricing, artwork, and footer. Small Client Components handle the navigation disclosure, feature tabs, and native unavailable-destination dialogs. The action implementation is shared by every callsite. Pricing requires no JavaScript while annual billing is unavailable.

The feature selector keeps state locally. Arrow keys, Home, and End move focus and selection. Its selected copy flows through CSS Grid alongside the tab list; only device mockups and decorative layers overlap. Hidden panels are removed from the accessibility tree. The native dialog supplies focus containment, Escape dismissal, and focus restoration.

The desktop composition uses bounded containers, Grid, and Flexbox. Navigation collapses below 1050px; complex content becomes a single column below 768px; security photography becomes two columns below 600px. Mockup overlaps retain their own coordinate space. Raster images use Next.js image optimization with responsive `sizes`; original PNGs remain in `public/assets`. Fixed mockup and photo slots reserve layout space. Decorative SVGs remain external local assets.

The final CTA pattern and QR code contain many vector layers in Figma. Their placement is preserved in scoped decorative components and `qr-layers.json`, rather than flattening the homepage or recreating the vectors. See the asset manifest for source node IDs, dimensions, and local paths.

Pending integrations do not simulate signup, form submission, or media playback. Set verified URLs in `site.ts`; additional pages remain outside this task. Metadata deliberately uses `noindex` while the page has pending integrations; review this before production publication.
