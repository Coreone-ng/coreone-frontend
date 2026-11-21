export type NextStep =
  "verify_email" | "verify_phone" | "create_business" | "dashboard";
export type Pending = {
  email: string;
  phone?: string;
  next_step: NextStep;
  resendAt: number;
  destination?: string;
};
export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email_verified: boolean;
  phone_verified: boolean;
};
export type Snapshot = {
  user?: User;
  next_step?: NextStep;
  pending?: Pending;
  reset?: Pending;
  canReset?: boolean;
  resetDone?: boolean;
  totp?: boolean;
  needsRefresh?: boolean;
};
export type Fields = Record<string, string>;
export const passwordHint =
  "Must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";
export const validEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
export const validPassword = (value: string) =>
  value.length >= 8 &&
  value.length <= 128 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /[0-9]/.test(value) &&
  /[^A-Za-z0-9\s]/.test(value);
export function normalizePhone(value: string) {
  const phone = value.replace(/[\s()-]/g, "");
  if (/^0[789]\d{9}$/.test(phone)) return `+234${phone.slice(1)}`;
  if (/^[789]\d{9}$/.test(phone)) return `+234${phone}`;
  if (/^234[789]\d{9}$/.test(phone)) return `+${phone}`;
  return phone;
}
export const validPhone = (value: string) =>
  /^\+234[789]\d{9}$/.test(normalizePhone(value));
export function signupErrors(values: Record<string, unknown>): Fields {
  const errors: Fields = {};
  for (const key of ["first_name", "last_name"])
    if (
      typeof values[key] !== "string" ||
      !(values[key] as string).trim() ||
      (values[key] as string).length > 100
    )
      errors[key] = "Enter a name of 1–100 characters.";
  if (!validEmail(String(values.email ?? "")))
    errors.email = "Enter a valid email address.";
  if (!validPhone(String(values.phone ?? "")))
    errors.phone = "Enter a valid Nigerian mobile number.";
  if (!validPassword(String(values.password ?? "")))
    errors.password = passwordHint;
  if (values.accept_terms !== true)
    errors.accept_terms =
      "Please agree to the Terms & Conditions and Privacy Policy.";
  return errors;
}
export function destination(snapshot: Snapshot) {
  if (snapshot.user) return "/onboarding/complete";
  if (snapshot.totp) return "/sign-in/totp";
  if (snapshot.pending) return "/onboarding/verify";
  return "/setup";
}
