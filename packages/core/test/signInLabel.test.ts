import { test } from "node:test";
import assert from "node:assert/strict";
import { labelInside } from "../src/signIn.ts";

test("a sign-in field shows its label inside, as a placeholder", () => {
  const field = { placeholder: "" };
  assert.equal(labelInside(field, "Name"), true);
  assert.equal(field.placeholder, "Name");
});

test("a field with a placeholder of its own keeps the label above it", () => {
  const field = { placeholder: "XXXX-XXXX-XXXX" };
  assert.equal(labelInside(field, "Recovery code"), false);
  assert.equal(field.placeholder, "XXXX-XXXX-XXXX");
});

test("a field with a hint keeps the label above it, where the hint stands", () => {
  const field = { placeholder: "" };
  assert.equal(labelInside(field, "Code", "From your authenticator app"), false);
  assert.equal(field.placeholder, "");
});

test("a field that is not there yet keeps the label above it", () => {
  assert.equal(labelInside(null, "Password"), false);
});

test("a label shown inside follows a new language", () => {
  const field = { placeholder: "" };
  labelInside(field, "Name");
  assert.equal(labelInside(field, "Benutzername", undefined, "Name"), true);
  assert.equal(field.placeholder, "Benutzername");
});
