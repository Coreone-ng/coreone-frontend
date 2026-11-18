# CoreOne website

Next.js App Router, React, strict TypeScript, and CSS Modules. Implemented from the supplied CoreOne Figma homepage, with original assets stored locally.

## Development

Requires Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000.

```sh
npm run typecheck
npm run build
npm start
```

The lockfile pins the installed dependency graph. The website includes the homepage, Features, Pricing, FAQs, About Us, Contact Us, Terms of Service, Privacy Policy, the blog index and supplied article, and a custom 404. Authentication and the application dashboard remain outside this implementation.

Run the targeted contact-validation and FAQ-search tests with `npm test`. See [website updates](docs/website-updates.md) and the [Features, Pricing, FAQ and blog-index update](docs/homepage-navigation-update.md) for route maps, local handoffs, and remaining content/integration gaps.

## Configuration

- Verified destinations belong in `src/config/site.ts`. Pending destinations are `null` and open an accessible unavailable notice. No external URLs have been invented.
- “See How It Works” scrolls to product features until `demoVideo` has a real destination.
- Monthly plan prices and entitlements live in `src/features/home/data/pricing.ts`. Annual billing is disabled because approved annual prices were not supplied.
- Typography and design tokens live in `src/styles/tokens.css`. BR Firma and Clash Grotesk were unavailable; the temporary stack is Avenir Next, Segoe UI, Arial, sans-serif. Supply licensed webfonts before approving exact typography.
- Feature state content lives in `src/features/home/data/features.ts`. All six feature states include their supplied copy and local desktop/mobile mockups. Expenses and Reports use the SVG exports supplied on 17 November 2026.

See [architecture](docs/architecture.md), [design references and limitations](docs/design-reference.md), and [verification](docs/verification.md).
