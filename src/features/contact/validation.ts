export type ContactValues = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
};
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
export const contactSubjects = [
  "General enquiry",
  "Product support",
  "Partnership",
] as const;
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (values.phone.trim() && !/^\+?[\d\s().-]{7,30}$/.test(values.phone.trim()))
    errors.phone = "Enter a valid phone number, including the country code.";
  if (!(contactSubjects as readonly string[]).includes(values.subject))
    errors.subject = "Choose a subject.";
  if (!values.message.trim()) errors.message = "Tell us how we can help.";
  if (!values.consent)
    errors.consent = "Agree to the privacy policy before continuing.";
  return errors;
}
