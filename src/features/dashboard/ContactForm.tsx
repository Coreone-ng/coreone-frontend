"use client";
import { useRef, useState, type FormEvent } from "react";
import { validEmail, validPhone } from "@/features/auth/model";
import { AppButton, Dialog, Field, Select } from "./components";
import { blankContact, contactName, type Contact } from "./model";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./Dashboard.module.css";

export function ContactForm({
  contact,
  onSaved,
  onClose,
}: {
  contact?: Contact;
  onSaved?: (contact: Contact) => void;
  onClose: () => void;
}) {
  const { setContacts } = useWorkspace();
  const [draft, setDraft] = useState({ ...(contact || blankContact) });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const submitted = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const update = (key: keyof Contact, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };
  function continueForm(event: FormEvent) {
    event.preventDefault();
    const invalid: Record<string, string> = {};
    for (const key of [
      "firstName",
      "lastName",
      "address",
      "country",
      "state",
    ] as const)
      if (!draft[key].trim()) invalid[key] = "This field is required.";
    if (!validEmail(draft.email))
      invalid.email = "Enter a valid email address.";
    if (!validPhone(draft.phone))
      invalid.phone = "Enter a valid Nigerian mobile number.";
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setStep(1);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (submitted.current) return;
    submitted.current = true;
    const record: Contact = {
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
      id: contact?.id || `sample-${crypto.randomUUID()}`,
    };
    setContacts((current) =>
      contact
        ? current.map((item) => (item.id === contact.id ? record : item))
        : [record, ...current],
    );
    onSaved?.(record);
    setDone(true);
  }
  if (done)
    return (
      <Dialog
        title="Successful"
        description={`Sample customer details have been ${contact ? "updated" : "created"} successfully. No business records were saved.`}
        onClose={onClose}
      >
        <div className={styles.successMark} aria-hidden="true">
          ✓
        </div>
        <AppButton onClick={onClose}>Done</AppButton>
      </Dialog>
    );
  return (
    <Dialog
      title={contact ? "Edit Customer Details" : "Add New Customer"}
      description={
        contact
          ? "Edit a customer profile."
          : "Create a customer or vendor profile."
      }
      drawer
      onClose={onClose}
    >
      <div className={styles.formSteps}>
        <button
          type="button"
          aria-current={step === 0 ? "step" : undefined}
          onClick={() => setStep(0)}
        >
          Profile
        </button>
        <span aria-hidden="true">›</span>
        <span aria-current={step === 1 ? "step" : undefined}>
          Tax Information
        </span>
      </div>
      {Object.keys(errors).length > 0 && step === 0 && (
        <p ref={errorRef} tabIndex={-1} className={styles.error} role="alert">
          Please check the highlighted fields.
        </p>
      )}
      <form onSubmit={step === 0 ? continueForm : save} noValidate>
        <fieldset className={styles.radioGroup}>
          <legend>Contact Type</legend>
          {(["Customer", "Vendor"] as const).map((type) => (
            <label key={type}>
              <input
                type="radio"
                name="contactType"
                value={type}
                checked={draft.type === type}
                onChange={() => update("type", type)}
              />
              {type}
            </label>
          ))}
        </fieldset>
        {step === 0 ? (
          <>
            <div className={styles.formColumns}>
              <Field
                label="First Name"
                name="firstName"
                value={draft.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="Enter your first name"
                maxLength={100}
                required
                error={errors.firstName}
              />
              <Field
                label="Last Name"
                name="lastName"
                value={draft.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Enter your last name"
                maxLength={100}
                required
                error={errors.lastName}
              />
            </div>
            <Field
              label="Email Address"
              name="email"
              type="email"
              value={draft.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              maxLength={254}
              required
              error={errors.email}
            />
            <Field
              label="Phone Number"
              name="phone"
              type="tel"
              value={draft.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+2348123456789"
              maxLength={20}
              required
              error={errors.phone}
            />
            <Field
              label="Street Address"
              name="address"
              value={draft.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Enter street address"
              maxLength={500}
              required
              error={errors.address}
            />
            <div className={styles.formColumns}>
              <Select
                label="Country"
                name="country"
                value={draft.country}
                onChange={(e) => update("country", e.target.value)}
                required
                aria-invalid={!!errors.country}
              >
                <option value="">Select</option>
                <option>Nigeria</option>
              </Select>
              <Select
                label="State"
                name="state"
                value={draft.state}
                onChange={(e) => update("state", e.target.value)}
                required
                aria-invalid={!!errors.state}
              >
                <option value="">Select</option>
                <option>Lagos</option>
              </Select>
            </div>
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={onClose}>
                Cancel
              </AppButton>
              <AppButton type="submit">Continue</AppButton>
            </div>
          </>
        ) : (
          <>
            <Field
              label="Tax identification number (TIN)"
              name="tin"
              value={draft.tin}
              onChange={(e) => update("tin", e.target.value)}
              placeholder="Enter TIN"
              maxLength={50}
            />
            <Field
              label="Legacy TIN"
              name="legacyTin"
              value={draft.legacyTin}
              onChange={(e) => update("legacyTin", e.target.value)}
              placeholder="Enter Legacy TIN, if applicable"
              maxLength={50}
            />
            <p className={styles.small}>
              Sample profile only. Tax identifiers are not validated or
              submitted.
            </p>
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={() => setStep(0)}>
                Back
              </AppButton>
              <AppButton type="submit">
                {contact
                  ? "Update info"
                  : `Create ${draft.type.toLowerCase()} profile`}
              </AppButton>
            </div>
          </>
        )}
      </form>
    </Dialog>
  );
}
export function DeleteContact({
  contact,
  onClose,
  onDeleted,
}: {
  contact: Contact;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const { setContacts } = useWorkspace();
  const [done, setDone] = useState(false);
  return (
    <Dialog
      title={done ? "Customer Deleted" : "Delete Customer?"}
      description={
        done
          ? "This sample customer and profile information has been deleted successfully."
          : "Are you sure you want to delete this customer? Only this sample entry will be removed from the directory."
      }
      onClose={() => {
        onClose();
        if (done) onDeleted?.();
      }}
    >
      {done ? (
        <>
          <div className={styles.successMark} aria-hidden="true">
            ✓
          </div>
          <AppButton
            onClick={() => {
              onClose();
              onDeleted?.();
            }}
          >
            Done
          </AppButton>
        </>
      ) : (
        <>
          <div className={styles.deleteIdentity}>
            <span className={styles.avatar}>
              {contact.firstName[0]}
              {contact.lastName[0]}
            </span>
            <div>
              <strong>{contactName(contact)}</strong>
              <p>{contact.type}</p>
            </div>
          </div>
          <div className={styles.dialogActions}>
            <AppButton variant="secondary" onClick={onClose}>
              Cancel
            </AppButton>
            <AppButton
              variant="danger"
              onClick={() => {
                setContacts((current) =>
                  current.filter((item) => item.id !== contact.id),
                );
                setDone(true);
              }}
            >
              Yes, delete customer
            </AppButton>
          </div>
        </>
      )}
    </Dialog>
  );
}
