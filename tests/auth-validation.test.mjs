import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizePhone,
  validPhone,
  validPassword,
  signupErrors,
  destination,
} from "../src/features/auth/model.ts";

test("Nigerian phone inputs normalize to the backend's E.164 format", () => {
  for (const value of [
    "08012345678",
    "8012345678",
    "2348012345678",
    "+234 (801) 234-5678",
  ]) {
    assert.equal(normalizePhone(value), "+2348012345678");
    assert.equal(validPhone(value), true);
  }
  for (const value of [
    "",
    "123",
    "+18012345678",
    "080123456789",
    "0801abc5678",
  ])
    assert.equal(validPhone(value), false);
});

test("password policy enforces every requirement and the API maximum", () => {
  assert.equal(validPassword("Example8!"), true);
  for (const value of [
    "short1!",
    "alllowercase8!",
    "ALLUPPERCASE8!",
    "MissingNumber!",
    "MissingSpecial8",
    "A1!" + "x".repeat(126),
  ])
    assert.equal(validPassword(value), false);
});

test("signup requires valid identity fields and explicit terms consent", () => {
  const valid = {
    first_name: "Ada",
    last_name: "Example",
    email: "ada@example.test",
    phone: "08012345678",
    password: "Example8!",
    accept_terms: true,
  };
  assert.deepEqual(signupErrors(valid), {});
  const errors = signupErrors({
    ...valid,
    first_name: " ",
    email: "bad@",
    phone: "123",
    accept_terms: "true",
  });
  assert.deepEqual(Object.keys(errors).sort(), [
    "accept_terms",
    "email",
    "first_name",
    "phone",
  ]);
  assert.equal(
    signupErrors({ ...valid, marketing_opt_in: false }).marketing_opt_in,
    undefined,
  );
});

test("routing follows authentication state without a plan or payment branch", () => {
  assert.equal(destination({}), "/setup");
  assert.equal(
    destination({
      pending: {
        email: "ada@example.test",
        next_step: "verify_email",
        resendAt: 0,
      },
    }),
    "/onboarding/verify",
  );
  assert.equal(destination({ totp: true }), "/sign-in/totp");
  for (const next_step of ["dashboard", "create_business"])
    assert.equal(
      destination({ user: { id: "test" }, next_step }),
      "/onboarding/complete",
    );
});
