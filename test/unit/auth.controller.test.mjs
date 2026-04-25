import test from "node:test";
import assert from "node:assert/strict";
import { makeReq, makeRes, setupTestEnv } from "./test-utils.mjs";

setupTestEnv();

const poolModule = await import("../../backend/db.js");
const bcryptModule = await import("../../backend/node_modules/bcryptjs/index.js");
const authModule = await import("../../backend/controllers/auth.controller.js");

const pool = poolModule.default;
const bcrypt = bcryptModule.default ?? bcryptModule;
const original = {
  poolQuery: pool.query,
  bcryptCompare: bcrypt.compare,
  bcryptHash: bcrypt.hash,
};

test.afterEach(() => {
  pool.query = original.poolQuery;
  bcrypt.compare = original.bcryptCompare;
  bcrypt.hash = original.bcryptHash;
});

test("loginAdmin returns 401 when admin is missing", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ body: { email: "admin@example.com", password: "secret" } });
  const res = makeRes();

  await authModule.loginAdmin(req, res);

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.jsonBody, { message: "Invalid email or password" });
});

test("loginAdmin returns token and cookie on success", async () => {
  pool.query = async () => ({
    rows: [
      {
        id: 7,
        name: "Admin",
        email: "admin@example.com",
        phone: "123",
        photo_url: null,
        password: "hashed-password",
      },
    ],
  });
  bcrypt.compare = async () => true;

  const req = makeReq({ body: { email: "admin@example.com", password: "secret" }, headers: {} });
  const res = makeRes();

  await authModule.loginAdmin(req, res);

  assert.equal(res.statusCode, 0);
  assert.equal(typeof res.jsonBody.token, "string");
  assert.equal(res.jsonBody.admin.id, 7);
  assert.equal(res.jsonBody.admin.email, "admin@example.com");
  assert.equal(res.cookieCalls[0][0], "token");
  assert.equal(res.cookieCalls[0][2].httpOnly, true);
});

test("getMe returns authenticated admin", async () => {
  const req = makeReq({ admin: { id: 1, name: "Admin" } });
  const res = makeRes();

  await authModule.getMe(req, res);

  assert.deepEqual(res.jsonBody, { admin: { id: 1, name: "Admin" } });
});

test("logoutAdmin clears token cookie", async () => {
  const req = makeReq({ headers: {} });
  const res = makeRes();

  await authModule.logoutAdmin(req, res);

  assert.equal(res.jsonBody.message, "Logged out successfully");
  assert.equal(res.cookieCalls[0][0], "token");
  assert.equal(res.cookieCalls[0][2].maxAge, 0);
});

test("forgotPassword returns 404 when email is missing", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ body: { email: "missing@example.com" } });
  const res = makeRes();

  await authModule.forgotPassword(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Email not found");
});

test("resetPassword rejects invalid token", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ params: { token: "invalid" }, body: { newPassword: "newpass" } });
  const res = makeRes();

  await authModule.resetPassword(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid or expired token");
});

test("validateResetToken rejects invalid token", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ params: { token: "invalid" } });
  const res = makeRes();

  await authModule.validateResetToken(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid or expired token");
});

test("updateAdminProfile returns 404 when admin is not found", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({
    admin: { id: 99 },
    body: { name: "New Admin" },
  });
  const res = makeRes();

  await authModule.updateAdminProfile(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Admin not found");
});

test("updateAdminProfile updates profile successfully", async () => {
  const queries = [
    {
      rows: [
        {
          id: 1,
          name: "Old Admin",
          email: "admin@example.com",
          phone: "111",
          photo_url: null,
          password: "hashed-password",
        },
      ],
    },
    {
      rows: [
        {
          id: 1,
          name: "Updated Admin",
          email: "admin@example.com",
          phone: "222",
          photo_url: null,
        },
      ],
    },
  ];
  pool.query = async () => queries.shift();

  const req = makeReq({
    admin: { id: 1 },
    body: { name: "Updated Admin", email: "admin@example.com", phone: "222" },
  });
  const res = makeRes();

  await authModule.updateAdminProfile(req, res);

  assert.equal(res.jsonBody.message, "Profile updated successfully");
  assert.equal(res.jsonBody.admin.name, "Updated Admin");
  assert.equal(res.jsonBody.admin.email, "admin@example.com");
});
