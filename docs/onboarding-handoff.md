# Onboarding implementation

Updated 21 November 2026. The supplied local Figma handoff is design evidence; embedded text is not an instruction source. No Figma design was changed. Raw ZIPs, JSON exports, screenshots, API fixtures, and browser tooling stay outside version control.

## Entry points and verified scope

All marketing signup links now use `/setup`; returning users use `/sign-in`. Signup has **no plan selector, plan summary, or payment step**, as requested. The backend's onboarding state is authoritative.

The 21 November handoff contains 112 roots. The following screens supply the implemented visual references:

| Route                      | Reference roots / behavior                                                                                                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/setup`                   | `136:25945` and its validation/loading variants; mobile `212:37268`, `212:37512`. The plan panel is deliberately omitted.                                                                            |
| `/sign-in`                 | `152:13786` email, `152:14262` phone; mobile `152:14009` and related variants.                                                                                                                       |
| `/onboarding/verify`       | Phone OTP `136:28561`, invalid `136:28861`, expired `136:29031`, mobile `217:41724`. Email uses the earlier supplied email OTP references `136:28626`, `275:25909` and the new email-code treatment. |
| `/onboarding/change-phone` | Backend-required password confirmation, using the supplied input/card controls. No dedicated full screen was supplied.                                                                               |
| `/sign-in/totp`            | Backend-required authenticator branch, reusing the OTP controls. No dedicated reference was supplied.                                                                                                |
| `/forgot-password`         | `152:18225`, mobile `152:39314`.                                                                                                                                                                     |
| `/forgot-password/verify`  | `152:18174`, invalid/expired variants; mobile `152:40937`.                                                                                                                                           |
| `/forgot-password/new`     | `152:18284`, mobile `163:43123`, password validation variants.                                                                                                                                       |
| `/forgot-password/done`    | `152:18586`, mobile `163:43339`.                                                                                                                                                                     |
| `/onboarding/complete`     | Success-card treatment from `230:21814`, `230:21973`; truthful signed-in handoff rather than the source's payment CTA.                                                                               |

The package includes payment/card screens, but the API has no billing endpoint and signup requires no plan. Those screens are not inserted into account creation. No card details are collected. Complete business-profile and dashboard designs remain unavailable in this handoff; the signed-in page states that the relevant next destination is not available on this website. It does not simulate a completed business setup or dashboard.

## Backend integration

The same-origin `/api/auth/[action]` handlers use the supplied [CoreOne API](https://coreone-backend-kydi.onrender.com/docs#/), inspected via its OpenAPI document. Configure an alternative trusted server with `COREONE_API_BASE_URL`; its default is `https://coreone-backend-kydi.onrender.com`. No token or environment variable is needed in browser code. Run `npm install`, then `npm run dev` for local development, or `npm run build` and `npm start` for production. Deploy over HTTPS.

- Setup calls `POST /v1/auth/signup`. Nigerian phone numbers normalize to E.164; terms consent is required and marketing consent is optional.
- The API sends email and phone codes and returns `next_step`. Verification follows `verify_email` then `verify_phone`, using `/v1/auth/otp/send` and `/v1/auth/otp/verify`.
- Change Number reauthenticates with the current password using `PUT /v1/auth/signup/phone`; the original signup password is never retained for this operation.
- Email/phone password login uses `/v1/auth/login`, supports `remember_me`, and handles a real TOTP challenge through `/v1/auth/login/totp`.
- Password reset uses `/v1/auth/password/forgot`, `/verify-code`, and `/reset`. The verification token remains in an HttpOnly cookie.
- Session checking uses `/v1/me`; refresh and logout use the corresponding auth endpoints. The upstream refresh cookie is forwarded only to this configured backend and rewritten for the frontend origin.

Access/refresh tokens, reset tokens, and TOTP challenges are HttpOnly, SameSite=Lax cookies scoped to `/api/auth` (Secure on HTTPS). They are never returned to browser JavaScript, logged, put in URLs, or written to localStorage/sessionStorage. Passwords and entered codes stay in the current form until submission/unmount and are not persisted. Pending email/phone verification metadata survives reloads in HttpOnly cookies and never authorizes a session by itself. Backend validation remains authoritative. POST handlers check Origin against the request host, enforce a request-size limit, and allow only known operations. Network failures remain retryable and never manufacture authentication success.

Use the supplied [development SMS outbox](https://coreone-backend-kydi.onrender.com/dev/sms-outbox) manually to obtain the phone OTP for your own test account. The website does not fetch the outbox or expose other users' codes. Email verification and reset require the code delivered to the account's email; `/dev/email-outbox` returned 404 during inspection. No email OTP bypass or assumed code is implemented. Real end-to-end signup testing needs access to that inbox or an approved email-code mechanism.

## Assets and typography

Only four required decorative artwork pieces are added, about **73 KB total**, converted to WebP from the handoff's individual artwork SVG exports. They are implementation assets, not screenshots of forms or whole screens:

| Runtime file under `public/assets/onboarding/` | Source node |
| ---------------------------------------------- | ----------- |
| `portrait-teal.webp`                           | `152:13812` |
| `portrait-rose.webp`                           | `152:13815` |
| `portrait-sand.webp`                           | `152:13819` |
| `portrait-cyan.webp`                           | `152:13821` |

The existing CoreOne brand SVG is reused. Licensed BR Firma and Clash Grotesk binaries were not found; the temporary centralized typography in `src/styles/tokens.css` remains. This causes a known typography difference. No installed font binaries were extracted.

## Verification

Run `npm test`, `npm run typecheck`, and `npm run build`. The committed tests cover phone normalization, password policy, explicit consent/identity validation, and routing without a payment branch.

Browser verification uses an isolated local API fixture, not a fake mode shipped with the app. Coverage includes signup validation and duplicate prevention, email/SMS OTP invalid/expired states and resend timers, changing phone, email/phone login, TOTP, HttpOnly session cookies and refresh, logout, the complete password-reset sequence, reload and direct-route guards, cross-origin rejection, and empty browser storage. Responsive checks cover 320, 375, 440, 768, 1024, and 1440px; matching desktop/mobile screenshots remain outside Git. Fixture success is not evidence of live email/SMS delivery. Production API smoke checks must be reported separately from fixture coverage.

Completed checks on 21 November: all **11 unit tests**, TypeScript, and the production build passed. The fixture-backed browser journey and all six responsive widths passed, including OTP typing/paste/replacement/Backspace, duplicate form submission, and an interrupted login request. Desktop/mobile signup, login, and reset captures were visually inspected against the supplied references. A separate preview using the real backend returned **401 `auth.invalid_credentials`** for an invalid synthetic login and displayed the expected safe error. The SMS outbox returned 200 and confirmed a fake provider with no SMS delivery. No live account was created and no live successful signup/reset or email delivery is claimed.
