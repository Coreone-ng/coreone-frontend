# Architecture

`src/app/page.tsx` composes the homepage and owns no interaction state. The header is a banner landmark, all homepage sections are inside the main landmark, and the footer is a content-info landmark. The layout owns metadata, language, global styles, and the skip link.

`src/components/ui` contains the reusable container, section-heading/eyebrow, and action primitives. `src/components/layout` contains site navigation and footer. Each component owns a CSS Module. Colors, fonts, common spacing, radii, and shadows are shared through CSS custom properties in `src/styles/tokens.css`.

`src/features/home/components` contains independent section components. `src/features/home/data` contains typed feature states, plan entitlements, and source image dimensions. Navigation and external destination configuration are separate from page content in `src/config`.

Server Components render the page, sections, pricing, artwork, and footer. Small Client Components handle the navigation disclosure, feature tabs, and native unavailable-destination dialogs. The action implementation is shared by every callsite. Pricing requires no JavaScript while annual billing is unavailable.

The feature selector keeps state locally. Arrow keys, Home, and End move focus and selection. Its selected copy flows through CSS Grid alongside the tab list; only device mockups and decorative layers overlap. Hidden panels are removed from the accessibility tree. The native dialog supplies focus containment, Escape dismissal, and focus restoration.

The desktop composition uses bounded containers, Grid, and Flexbox. Navigation collapses below 1050px; complex content becomes a single column below 768px; security photography becomes two columns below 600px. Mockup overlaps retain their own coordinate space. Raster images use Next.js image optimization with responsive `sizes`; original PNGs remain in `public/assets`. Fixed mockup and photo slots reserve layout space. Decorative SVGs remain external local assets.

The final CTA pattern and QR code contain many vector layers in Figma. Their placement is preserved in scoped decorative components and `qr-layers.json`, rather than flattening the homepage or recreating the vectors. See the asset manifest for source node IDs, dimensions, and local paths.

Pending integrations do not simulate signup, form submission, or media playback. Verified destinations live in `site.ts`; the additional website routes are described below. Metadata deliberately uses `noindex` while the site has pending integrations; review this before production publication.

## Additional website pages

The local desktop-updates handoff adds thin routes for About, Contact, Terms, Privacy, and the supplied blog article. `MarketingPage` composes the existing header/footer around a main landmark. The homepage keeps its existing section composition. Shared navigation now points to the full Features/Pricing/FAQ/blog pages from the subsequent handoff; homepage demo controls retain their section anchors. The header derives its current-page state from the pathname, including nested article routes, and exposes `aria-current` through `Action`.

`src/features/about` owns the company story, values, principles, original photography, and vision artwork. `src/features/legal` shares a document layout and an anchor-based table of contents between the 19-section Terms and 14-section Privacy documents. Their content is local JSON transcribed from the handoff, with source node IDs. A small Client Component tracks visible sections; the links themselves work without JavaScript.

`src/features/contact` owns the contact form, pure typed validation, inline errors and focus, and alternate contact channels. `Button` reuses the action styling for native form submission, and `FormControls` supplies scoped field styles. Without a delivery contract, the form validates and displays an explicit unavailable notice, retaining entered values and sending no request. Native email and phone links remain usable. Submit controls wait for hydration to avoid accidental fallback GET submissions.

`src/features/blog` renders the supplied article and related-card data using normal HTML, local images, a copy-link control, and an explicitly unavailable newsletter form. `/blog` now renders the supplied index, whose missing article destinations and pagination remain unavailable. `src/app/not-found.tsx` composes the source 404 design and returns the normal Next.js unmatched-route response.

`ProductHero` shares the left-aligned introduction style between Features, Pricing, and FAQs. `src/features/product` owns the twelve-section catalogue, original category icons, and sticky anchor navigation. `src/features/pricing` composes the existing homepage pricing cards with the shared FAQ section. `FinalCtaSection` accepts text/destination overrides while preserving the homepage defaults.

`src/features/faq` keeps the exported questions/answers in data, search matching in a pure typed function, and small client components for query/accordion state. Only the search/answer region is a Client Component; the page shell, footer, and closing CTA remain Server Components. The first answer is exported source copy; the other six use lorem ipsum at the user's explicit request. The blog index reuses the newsletter form with a brand-color variant and preserves the article's purple default.
