import test from "node:test";
import assert from "node:assert/strict";
import { validateContact } from "../src/features/contact/validation.ts";

const valid = {
  fullName: "Ada Okafor",
  company: "",
  email: "ada@example.com",
  phone: "",
  subject: "Product support",
  message: "I need help reviewing an imported statement.",
  consent: true,
};

test("a contact request requires meaningful name, email, subject, message and consent", () => {
  const errors = validateContact({
    ...valid,
    fullName: "  ",
    email: "",
    subject: "",
    message: "\n ",
    consent: false,
  });
  assert.deepEqual(Object.keys(errors), [
    "fullName",
    "email",
    "subject",
    "message",
    "consent",
  ]);
});
test("contact validation accepts optional company and phone while retaining valid international phone formatting", () => {
  assert.deepEqual(validateContact(valid), {});
  assert.deepEqual(
    validateContact({
      ...valid,
      email: " ada@example.com ",
      phone: "+234 (803) 123-4567",
    }),
    {},
  );
});
test("invalid email, phone and unknown subject have field errors", () => {
  for (const email of ["ada", "ada@", "ada@example", "ada example@example.com"])
    assert.ok(validateContact({ ...valid, email }).email);
  assert.ok(validateContact({ ...valid, phone: "call me" }).phone);
  assert.ok(
    validateContact({ ...valid, subject: "not a supported subject" }).subject,
  );
});
