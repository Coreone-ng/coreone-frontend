import { NextRequest, NextResponse } from "next/server";
import { businessErrors, type BusinessOptions } from "./business";
import {
  normalizePhone,
  signupErrors,
  validEmail,
  validPassword,
  validPhone,
  type Pending,
  type Snapshot,
} from "./model";

// Only this server module knows upstream URLs or receives tokens.
const base = () =>
  (
    process.env.COREONE_API_BASE_URL ||
    "https://coreone-backend-kydi.onrender.com"
  ).replace(/\/$/, "");
const names = {
  access: "coreone_access",
  refresh: "coreone_refresh",
  pending: "coreone_pending",
  reset: "coreone_reset",
  resetToken: "coreone_reset_token",
  done: "coreone_reset_done",
  challenge: "coreone_totp",
  next: "coreone_next",
};
const messages: Record<string, string> = {
  "auth.invalid_credentials":
    "The email, phone number, or password is incorrect.",
  "auth.email_taken": "This email already has an account. Please sign in.",
  "auth.phone_taken":
    "This phone number already has an account. Please sign in.",
  "auth.otp_invalid": "That code is incorrect. Please try again.",
  "auth.otp_expired": "This code has expired. Please request a new code.",
  "auth.otp_attempts_exceeded": "Too many attempts. Please request a new code.",
  "auth.otp_cooldown": "Please wait before requesting another code.",
  "auth.rate_limited": "Too many requests. Please wait and try again.",
  "auth.account_locked": "Your account is locked. Please contact support.",
  "auth.verification_required": "Please verify your account before signing in.",
};
function decode(value?: string): Pending | undefined {
  try {
    const data = JSON.parse(Buffer.from(value || "", "base64url").toString());
    return validEmail(data.email) && typeof data.resendAt === "number"
      ? data
      : undefined;
  } catch {
    return undefined;
  }
}
function encode(value: Pending) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
export async function handleAuth(request: NextRequest, action: string) {
  const read = (key: keyof typeof names) =>
    request.cookies.get(names[key])?.value;
  const pending = decode(read("pending"));
  const reset = decode(read("reset"));
  const secure =
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";
  // Next's internal URL can use localhost even when the browser uses 127.0.0.1.
  // Compare against the actual request host, including its development port.
  const expectedOrigin = new URL(
    `${secure ? "https" : "http"}://${request.headers.get("host")}`,
  ).origin;
  const response = (body: unknown, status = 200) =>
    NextResponse.json(body, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  const cookie = (
    res: NextResponse,
    key: keyof typeof names,
    value: string,
    maxAge: number,
  ) =>
    res.cookies.set(names[key], value, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/api/auth",
      maxAge,
    });
  const clear = (res: NextResponse, keys: (keyof typeof names)[]) =>
    keys.forEach((key) => cookie(res, key, "", 0));
  const upstream = (
    path: string,
    body?: unknown,
    method = "POST",
    headers: Record<string, string> = {},
  ) =>
    fetch(`${base()}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(45000),
    });
  const storeSession = (
    res: NextResponse,
    session: Record<string, unknown>,
    upstreamResponse: Response,
  ) => {
    cookie(
      res,
      "access",
      String(session.access_token),
      Number(session.expires_in) || 900,
    );
    cookie(res, "next", String(session.next_step), 60 * 60 * 24 * 30);
    for (const header of upstreamResponse.headers.getSetCookie()) {
      const match = /^coreone_refresh=([^;]*)/i.exec(header);
      if (match) {
        const age = /max-age=(\d+)/i.exec(header);
        const expiry = /expires=([^;]+)/i.exec(header);
        const maxAge = age
          ? Number(age[1])
          : expiry
            ? Math.max(
                0,
                Math.floor((Date.parse(expiry[1]) - Date.now()) / 1000),
              )
            : undefined;
        res.cookies.set(names.refresh, match[1], {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/api/auth",
          ...(maxAge === undefined ? {} : { maxAge }),
        });
      }
    }
    clear(res, ["pending", "challenge", "reset", "resetToken", "done"]);
  };
  try {
    if (action === "business-options" && request.method === "GET") {
      const result = await upstream("/v1/onboarding/options", undefined, "GET");
      return result.ok
        ? response(await result.json())
        : response(
            { message: "We couldn’t load setup choices. Please retry." },
            503,
          );
    }
    if (action === "session" && request.method === "GET") {
      const snapshot: Snapshot = {
        pending,
        reset,
        canReset: !!read("resetToken"),
        resetDone: !!read("done"),
        totp: !!read("challenge"),
      };
      const token = read("access");
      if (token) {
        const result = await upstream("/v1/me", undefined, "GET", {
          Authorization: `Bearer ${token}`,
        });
        if (result.ok) {
          const user = await result.json();
          snapshot.user = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            email_verified: user.email_verified,
            phone_verified: user.phone_verified,
          };
          const organizations = await upstream("/v1/orgs", undefined, "GET", {
            Authorization: `Bearer ${token}`,
          });
          if (organizations.status === 401) {
            snapshot.user = undefined;
            snapshot.needsRefresh = !!read("refresh");
          } else if (!organizations.ok)
            return response(
              {
                message: "We couldn’t check your business setup. Please retry.",
              },
              503,
            );
          else {
            const { data } = await organizations.json();
            if (!Array.isArray(data))
              return response(
                {
                  message:
                    "We couldn’t check your business setup. Please retry.",
                },
                503,
              );
            snapshot.next_step = data.length ? "dashboard" : "create_business";
            if (data.length === 1)
              snapshot.organization = {
                id: data[0].id,
                legal_name: data[0].legal_name,
              };
          }
        } else if (result.status === 401)
          snapshot.needsRefresh = !!read("refresh");
        else
          return response(
            { message: "We couldn’t check your session. Please retry." },
            503,
          );
      } else snapshot.needsRefresh = !!read("refresh");
      return response(snapshot);
    }
    if (
      request.method !== "POST" ||
      request.headers.get("origin") !== expectedOrigin
    )
      return response(
        { message: "Request origin could not be verified." },
        403,
      );
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return response({ message: "JSON is required." }, 415);
    const raw = await request.text();
    if (raw.length > 16384)
      return response({ message: "Request is too large." }, 413);
    let input: Record<string, unknown>;
    try {
      input = JSON.parse(raw);
      if (!input || Array.isArray(input) || typeof input !== "object")
        throw Error();
    } catch {
      return response({ message: "Invalid request." }, 400);
    }
    if (action === "clear-flow") {
      const res = response({});
      clear(res, ["pending", "reset", "resetToken", "done", "challenge"]);
      return res;
    }
    const text = (key: string) =>
      typeof input[key] === "string" ? (input[key] as string) : "";
    let path = "",
      method = "POST",
      body: Record<string, unknown> = {},
      errors: Record<string, string> = {};
    const email = text("email").trim().toLowerCase();
    const code = text("code");
    const requireEmail = () => {
      if (!validEmail(email)) errors.email = "Enter a valid email address.";
    };
    const requireCode = () => {
      if (!/^\d{6}$/.test(code)) errors.code = "Enter the 6-digit code.";
    };
    const password = text("password");
    switch (action) {
      case "create-business": {
        const token = read("access");
        if (!token)
          return response(
            {
              message: "Your session needs refreshing. Please try again.",
              code: "auth.session_expired",
            },
            401,
          );
        const authorization = { Authorization: `Bearer ${token}` };
        const identity = await upstream(
          "/v1/me",
          undefined,
          "GET",
          authorization,
        );
        if (identity.status === 401)
          return response(
            {
              message: "Your session needs refreshing. Please try again.",
              code: "auth.session_expired",
            },
            401,
          );
        if (!identity.ok)
          return response(
            { message: "We couldn’t check your account. Please retry." },
            503,
          );
        const user = await identity.json();
        if (!user.email_verified || !user.phone_verified)
          return response(
            {
              message:
                "Verify your email and phone before creating a business.",
            },
            403,
          );
        const choices = await upstream(
          "/v1/onboarding/options",
          undefined,
          "GET",
        );
        if (!choices.ok)
          return response(
            { message: "We couldn’t load setup choices. Please retry." },
            503,
          );
        const options: BusinessOptions = await choices.json();
        body = {
          legal_name: text("legal_name").trim(),
          industry: text("industry"),
          business_structure: text("business_structure"),
          owner_role: text("owner_role"),
          employee_range: text("employee_range"),
          goals: input.goals,
        };
        errors = businessErrors(body, options);
        if (Object.keys(errors).length)
          return response(
            { message: "Please check the highlighted fields.", errors },
            422,
          );
        const existing = await upstream(
          "/v1/orgs",
          undefined,
          "GET",
          authorization,
        );
        if (existing.status === 401)
          return response(
            {
              message: "Your session needs refreshing. Please try again.",
              code: "auth.session_expired",
            },
            401,
          );
        if (!existing.ok)
          return response(
            { message: "We couldn’t check existing businesses. Please retry." },
            503,
          );
        const list = await existing.json();
        if (!Array.isArray(list.data))
          return response(
            { message: "We couldn’t check existing businesses. Please retry." },
            503,
          );
        if (list.data.length)
          return response({ ok: true, already_exists: true });
        path = "/v1/orgs";
        break;
      }
      case "signup":
        body = {
          first_name: text("first_name").trim(),
          last_name: text("last_name").trim(),
          email,
          phone: normalizePhone(text("phone")),
          password,
          country_code: "NG",
          accept_terms: input.accept_terms === true,
          marketing_opt_in: input.marketing_opt_in === true,
        };
        errors = signupErrors(body);
        path = "/v1/auth/signup";
        break;
      case "login":
        if (text("phone")) {
          if (!validPhone(text("phone")))
            errors.phone = "Enter a valid Nigerian mobile number.";
          body.phone = normalizePhone(text("phone"));
          body.country_code = "NG";
        } else {
          requireEmail();
          body.email = email;
        }
        if (!password || password.length > 128)
          errors.password = "Enter your password (up to 128 characters).";
        body = { ...body, password, remember_me: input.remember_me === true };
        path = "/v1/auth/login";
        break;
      case "totp":
        if (!read("challenge"))
          return response(
            {
              message: "Your sign-in challenge expired. Please sign in again.",
            },
            409,
          );
        requireCode();
        body = { challenge_id: read("challenge"), code };
        path = "/v1/auth/login/totp";
        break;
      case "send-code":
      case "verify-code":
        if (!pending)
          return response(
            { message: "Start signup or resume verification first." },
            409,
          );
        if (action === "verify-code") requireCode();
        body = {
          email: pending.email,
          purpose:
            pending.next_step === "verify_phone"
              ? "verify_phone"
              : "verify_email",
          ...(action === "verify-code" ? { code } : {}),
        };
        path = `/v1/auth/otp/${action === "send-code" ? "send" : "verify"}`;
        break;
      case "resume":
        requireEmail();
        body = {
          email,
          purpose:
            input.purpose === "verify_phone" ? "verify_phone" : "verify_email",
        };
        path = "/v1/auth/otp/send";
        break;
      case "change-phone":
        if (!pending || pending.next_step !== "verify_phone")
          return response(
            { message: "Verify your email before changing your phone number." },
            409,
          );
        if (!validPhone(text("phone")))
          errors.phone = "Enter a valid Nigerian mobile number.";
        if (!password || password.length > 128)
          errors.password = "Enter your current password.";
        body = {
          email: pending.email,
          password,
          phone: normalizePhone(text("phone")),
          country_code: "NG",
        };
        path = "/v1/auth/signup/phone";
        method = "PUT";
        break;
      case "forgot-password":
        requireEmail();
        body = { email };
        path = "/v1/auth/password/forgot";
        break;
      case "verify-reset":
        if (!reset)
          return response({ message: "Request a password reset first." }, 409);
        requireCode();
        body = { email: reset.email, code };
        path = "/v1/auth/password/verify-code";
        break;
      case "reset-password":
        if (!read("resetToken"))
          return response(
            {
              message:
                "Your reset session expired. Please request another code.",
            },
            409,
          );
        if (!validPassword(text("new_password")))
          errors.new_password =
            "Choose a password with 8–128 characters, uppercase, lowercase, a number, and a special character.";
        body = {
          reset_token: read("resetToken"),
          new_password: text("new_password"),
        };
        path = "/v1/auth/password/reset";
        break;
      case "refresh":
      case "logout":
        path = `/v1/auth/${action}`;
        break;
      default:
        return response({ message: "Not found." }, 404);
    }
    if (Object.keys(errors).length)
      return response(
        { message: "Please check the highlighted fields.", errors },
        422,
      );
    const headers: Record<string, string> = {};
    if (action === "create-business")
      headers.Authorization = `Bearer ${read("access")}`;
    if ((action === "refresh" || action === "logout") && read("refresh"))
      headers.Cookie = `coreone_refresh=${read("refresh")}`;
    if (action === "logout" && read("access"))
      headers.Authorization = `Bearer ${read("access")}`;
    const result = await upstream(path, body, method, headers);
    const data = result.status === 204 ? {} : await result.json();
    if (!result.ok) {
      const fields: Record<string, string> = {};
      for (const error of Array.isArray(data.errors) ? data.errors : []) {
        if (
          [
            "email",
            "phone",
            "password",
            "first_name",
            "last_name",
            "new_password",
            "code",
            "accept_terms",
            "legal_name",
            "industry",
            "business_structure",
            "owner_role",
            "employee_range",
            "goals",
          ].includes(error.field)
        )
          fields[error.field] =
            error.field === "code"
              ? "Please check your verification code."
              : `Please check ${error.field.replaceAll("_", " ")}.`;
      }
      const retry = Math.max(
        0,
        Number(data.retry_after || result.headers.get("retry-after")) || 0,
      );
      const res = response(
        {
          message:
            messages[data.code] ||
            (result.status >= 500
              ? "The service is temporarily unavailable. Please try again."
              : "We couldn’t complete this request. Please check your details and try again."),
          code: data.code,
          errors: fields,
          retry_after: retry,
          verificationRequired: data.code === "auth.verification_required",
        },
        result.status,
      );
      if (retry && action === "send-code" && pending)
        cookie(
          res,
          "pending",
          encode({ ...pending, resendAt: Date.now() + retry * 1000 }),
          86400,
        );
      if (
        action === "refresh" &&
        (result.status === 401 || result.status === 403)
      )
        clear(res, ["access", "refresh", "next"]);
      return res;
    }
    const res = response({ ok: true });
    if (action === "create-business")
      cookie(res, "next", "dashboard", 60 * 60 * 24 * 30);
    if (action === "signup") {
      cookie(
        res,
        "pending",
        encode({
          email: data.email,
          phone: data.phone,
          next_step: data.next_step,
          resendAt: Date.now() + data.resend_available_in * 1000,
        }),
        86400,
      );
      clear(res, ["reset", "resetToken", "challenge", "done"]);
    }
    if (
      action === "send-code" ||
      action === "resume" ||
      action === "change-phone"
    ) {
      cookie(
        res,
        "pending",
        encode({
          ...(pending || {
            email,
            next_step:
              body.purpose === "verify_phone" ? "verify_phone" : "verify_email",
          }),
          ...(action === "change-phone" ? { phone: body.phone as string } : {}),
          resendAt: Date.now() + data.resend_available_in * 1000,
          destination: data.destination,
        }),
        86400,
      );
    }
    if (action === "verify-code" && pending && !data.session)
      cookie(
        res,
        "pending",
        encode({
          ...pending,
          next_step: data.next_step,
          destination: undefined,
          resendAt: 0,
        }),
        86400,
      );
    if (data.session) storeSession(res, data.session, result);
    if (action === "totp" || action === "refresh")
      storeSession(res, data, result);
    if (action === "login" && data.totp_required) {
      cookie(res, "challenge", data.challenge_id, 300);
      clear(res, ["pending", "reset", "resetToken", "done"]);
    }
    if (action === "forgot-password") {
      cookie(
        res,
        "reset",
        encode({
          email,
          next_step: "verify_email",
          resendAt: Date.now() + data.resend_available_in * 1000,
          destination: data.destination,
        }),
        1800,
      );
      clear(res, ["resetToken", "done"]);
    }
    if (action === "verify-reset")
      cookie(
        res,
        "resetToken",
        data.reset_token,
        Math.min(Number(data.expires_in) || 900, 900),
      );
    if (action === "reset-password") {
      clear(res, [
        "access",
        "refresh",
        "next",
        "pending",
        "reset",
        "resetToken",
        "challenge",
      ]);
      cookie(res, "done", "1", 300);
    }
    if (action === "logout")
      clear(res, Object.keys(names) as (keyof typeof names)[]);
    return res;
  } catch {
    return response(
      {
        message:
          "We couldn’t reach CoreOne. Please check your connection and try again. The service may take a moment to wake up.",
      },
      503,
    );
  }
}
