import type { Fields, Snapshot } from "./model";

export class AuthError extends Error {
  fields: Fields;
  retryAfter: number;
  code?: string;
  verificationRequired: boolean;
  constructor(data: {
    message?: string;
    errors?: Fields;
    retry_after?: number;
    code?: string;
    verificationRequired?: boolean;
  }) {
    super(data.message || "Something went wrong. Please try again.");
    this.fields = data.errors || {};
    this.retryAfter = data.retry_after || 0;
    this.code = data.code;
    this.verificationRequired = !!data.verificationRequired;
  }
}
export async function authRequest(
  action: string,
  body: Record<string, unknown> = {},
) {
  let response: Response;
  try {
    response = await fetch(`/api/auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError({
      message:
        "We couldn’t connect. Please check your connection and try again.",
    });
  }
  const data = await response.json();
  if (!response.ok) throw new AuthError(data);
  return data;
}
export async function loadSession(): Promise<Snapshot> {
  let response = await fetch("/api/auth/session", { cache: "no-store" });
  let data = await response.json();
  if (!response.ok) throw new AuthError(data);
  if (data.needsRefresh) {
    try {
      await authRequest("refresh");
    } catch (error) {
      response = await fetch("/api/auth/session", { cache: "no-store" });
      data = await response.json();
      if (!response.ok || data.needsRefresh) throw error;
      return data;
    }
    response = await fetch("/api/auth/session", { cache: "no-store" });
    data = await response.json();
    if (!response.ok) throw new AuthError(data);
  }
  return data;
}
