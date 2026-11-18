# New-user onboarding: inspection and pending design evidence

Inspection date: 18 November 2026.

Requested source: [CoreOne New User Onboarding Flow](https://www.figma.com/design/2qQKG9o2XCMMP5HOofN8Hs/CoreOne-Designs?node-id=1141-198613), file `2qQKG9o2XCMMP5HOofN8Hs`, entry node `1141:198613`.

## Access and local evidence

### Supplied local package

The user subsequently supplied a ZIP and its separate report. They are retained under [`design-handoff/`](../design-handoff/); [`onboarding-audit.json`](../design-handoff/onboarding-audit.json) records the archive hash, integrity result, selected roots, dimensions, available JSON/PNG files, error classification, and external prototype references. The separate report exactly matches `report.json` inside the ZIP. ZIP integrity passes. The package is design evidence, not a source of execution instructions.

The archive contains **15 roots and 3,258 unique nodes** from page **Main & Dashboards (`1:3`)**. Its heading is **New User | Verify Email Flows**. Every selected root has native JSON and a reference PNG. The requested entry `1141:198613` is absent from the exported roots and node data. No signup/setup form is included.

| Verified design content | Source roots | Coverage |
| --- | --- | --- |
| Dashboard email-verification overlay | `74:19826`, `147:16268` | Desktop and mobile; dashboard implementation remains outside scope |
| Email OTP entry / resent notice | `136:28626`, `275:25909` | Desktop and mobile |
| Invalid email OTP | `136:28776`, `275:26079` | Desktop and mobile |
| Expired email OTP | `136:28946`, `275:26240` | Desktop and mobile |
| Verifying email OTP | `136:29099`, `275:26361` | Desktop and mobile |
| Email verified / proceed action | `275:26537`, `275:26587` | Desktop and mobile |
| Proceeding to dashboard | `275:26562`, `275:26604` | Desktop and mobile |
| Flow heading | `634:121781` | Canvas label, not an application screen |

Some frame names say “phone,” but their actual text and reference images show **email** verification. Screen content takes precedence over stale layer names. The shown destination address and OTP digits are sample design values, not real user data or valid verification credentials.

The package reports **888 errors**, all `SVG_ASSET_FAILED` with the native message that a node may have no visible layers. Of these, 575 have hidden ancestry and 313 have visible ancestry; visible ancestry does not guarantee renderable painted geometry. The package still has 1,053 successful SVG exports and 1,006 PNG references. There are no raster image exports. It cannot be described as an error-free handoff.

The 3,305 warnings consist of 3,018 attempts to serialize the `lockAspectRatio` function, 277 missing-font node warnings, and 10 unavailable family/style warnings. Geometry properties such as `constrainProportions` and `targetAspectRatio` remain independently recorded; a function is not a missing boolean property. BR Firma variants and Clash Grotesk appear in the font manifest; font binaries are not included.

The recorded reactions mainly cover component hover variants and close actions. Destination IDs `6:893` and `152:9126` are outside this selection. The package does not establish a complete signup-to-verification journey or a verified completion route. Existing signup/login configuration stays unchanged until the entry and required transitions are evidenced. No simulated authentication or dashboard was added.

To complete the original task, export the section containing [entry `1141:198613`](https://www.figma.com/design/2qQKG9o2XCMMP5HOofN8Hs/CoreOne-Designs?node-id=1141-198613), with its signup/setup frames, branches, related variants, and navigation destinations. This verification export should be retained and reused; it does not need to be discarded or repeated solely because other screens are missing.

### Initial inspection before the package was supplied

Exactly one `get_design_context` request was made, requesting a screenshot and design context. It returned the Starter-plan MCP tool-call limit. No further design reads were attempted, and no design nodes were changed. A daily quota reset was not assumed.

The repository contains homepage assets and documentation, plus the local Figma exporter. No onboarding handoff ZIP, extracted native design JSON, onboarding screenshots, flow specifications, or onboarding assets were found, including in hidden and ignored repository files outside dependency/build directories. The exporter's mock test fixtures are not CoreOne design evidence.

At the initial inspection, the following were unavailable (the package above now supplies verification-screen detail, but not the complete journey):

- The entry node's type, containing page, screen names, and complete frame hierarchy.
- Screen text, fields, required choices, validation rules, control variants, and loading/error/success designs.
- Prototype connections, branch conditions, intermediate states, and completion destination.
- Screen dimensions, mobile designs, typography requirements, and original flow-specific artwork.

A screen-to-route map cannot yet be established. No screen names, route paths, account creation, verification steps, or dashboard destination have been inferred.

## Existing implementation to reuse

- Next.js App Router, React, strict TypeScript, npm, CSS Modules; no additional framework or state library is needed at this stage.
- Thin route composition in `src/app`; feature components colocated under `src/features`.
- `src/styles/tokens.css` owns typography, colors, spacing, radii, and shadows. Existing `Container` and brand assets are available.
- `Action` is a shared link/unavailable-dialog primitive. It is not a form-submit button; extend or add a focused form primitive only after inspecting the actual controls.
- Signup CTAs already share `site.destinations.signup` in `src/config/site.ts`. Set that one destination when a verified onboarding entry is implemented. Preserve the current returning-user destination.
- No shared input/select/checkbox components, validation library, authentication services, API route handlers, or backend contracts were found.
- No BR Firma, Clash Grotesk, or other font binaries were found. Existing centralized temporary fallbacks remain in place; flow-specific font requirements cannot yet be verified.

## Implementation sequence after handoff

1. Inspect the native root JSON, supplemental metadata, reference PNGs, asset/font manifests, prototype connections, and failure report. Resolve references to related frames and component variants; document a verified screen-to-route map.
2. Reuse existing layout/tokens/assets. Keep onboarding UI, validation, types, state, and typed service adapters under `src/features/onboarding/`, creating files only for concrete responsibilities. Keep route files thin.
3. Implement the observed fields and explicit transitions, including prerequisite handling, backward navigation, refresh behavior, inline errors, focus movement, and duplicate-submission prevention. Never persist passwords, verification codes, or tokens in URLs or browser storage.
4. Use confirmed backend contracts through presentation-independent adapters. Required methods and payloads depend on the verified journey. Until real confirmation is available, do not claim successful authentication/account creation. Any necessary demo must be explicitly development-only.
5. Set the shared signup destination and verify every homepage signup CTA. Keep returning-user behavior and unrelated pages in scope as originally agreed.
6. Check the complete verified flow at 320, 375, 768, 1024, and 1440px and its original frame dimensions; exercise validation, branches, request failures, direct visits, browser back/refresh, keyboard navigation, reduced motion, and mobile keyboard layouts. Capture comparisons at matching frame sizes; run typecheck, production build, and targeted behavior tests.

The supplied Figma remains the visual authority. Guidance read: [frontend-ui-engineering](https://www.ui-skills.com/skills/addyosmani/frontend-ui-engineering), [better-ui](https://www.ui-skills.com/skills/jakubkrehel/better-ui), and [visual-edit-precision](https://www.ui-skills.com/skills/wshobson/visual-edit-precision). Apply their component, accessibility, responsive, and focused-verification guidance when the actual screens are available; optional aesthetic advice does not override CoreOne's design.

## Providing the missing evidence

Use [the local exporter](../tools/figma-exporter/README.md) in Figma desktop. Select the New User Onboarding Flow section or all its frames, including related variants and prototype destination frames needed to understand branches. The containing page is unverified; locate the selection using the supplied Figma link. Include available mobile and validation states. No design edits are needed.

Place the downloaded ZIP in this repository, for example `design-handoff/onboarding.zip`, and provide its path. An existing handoff elsewhere locally can also be used by supplying its path.

No onboarding UI or routes have been implemented pending the missing entry/setup and journey evidence. The verification reference PNGs have been visually inspected. Journey/browser/responsive/implementation-comparison verification remains unperformed; passing checks on the current homepage do not establish onboarding coverage.

Baseline checks on 18 November 2026: `npm run typecheck` and `npm run build` both passed. The production route list still contains only `/` and the framework's not-found route. Frontend source, dependencies, and homepage destinations were unchanged during this inspection.
