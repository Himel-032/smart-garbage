import test from "node:test";
import assert from "node:assert/strict";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

const { generateToken } = await import("../../backend/lib/utils/generateToken.js");

function decodeJwtPayload(token) {
  const parts = token.split(".");
  assert.equal(parts.length, 3);

  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
  return JSON.parse(Buffer.from(paddedPayload, "base64").toString("utf8"));
}

test("generateToken returns a signed JWT with admin payload", () => {
  const token = generateToken({
    id: 42,
    name: "Test Admin",
    email: "admin@example.com",
  });

  const decoded = decodeJwtPayload(token);

  assert.equal(decoded.id, 42);
  assert.equal(decoded.name, "Test Admin");
  assert.equal(decoded.email, "admin@example.com");
});

test("generateToken produces a string token", () => {
  const token = generateToken({
    id: 1,
    name: "A",
    email: "a@example.com",
  });

  assert.equal(typeof token, "string");
  assert.ok(token.length > 10);
});
