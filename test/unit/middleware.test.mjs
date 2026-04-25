import test from "node:test";
import assert from "node:assert/strict";
import { makeReq, makeRes, setupTestEnv } from "./test-utils.mjs";

setupTestEnv();

const poolModule = await import("../../backend/db.js");
const jwtModule = await import("../../backend/node_modules/jsonwebtoken/index.js");
const protectModule = await import("../../backend/middleware/protectRoute.js");
const driverAuthModule = await import("../../backend/middleware/driverAuth.js");

const pool = poolModule.default;
const jwt = jwtModule.default ?? jwtModule;
const original = {
  poolQuery: pool.query,
  jwtVerify: jwt.verify,
};

test.afterEach(() => {
  pool.query = original.poolQuery;
  jwt.verify = original.jwtVerify;
});

test("protectRoute rejects missing token", async () => {
  const req = makeReq({ headers: {}, cookies: {} });
  const res = makeRes();
  let nextCalled = false;

  await protectModule.protectRoute(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.jsonBody.message, "Unauthorized: No token provided");
});

test("protectRoute rejects invalid token", async () => {
  jwt.verify = () => {
    throw new Error("bad token");
  };

  const req = makeReq({ headers: { authorization: "Bearer bad" }, cookies: {} });
  const res = makeRes();
  let nextCalled = false;

  await protectModule.protectRoute(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.jsonBody.message, "Unauthorized: Token verification failed");
});

test("protectRoute attaches admin and calls next", async () => {
  jwt.verify = () => ({ id: 5 });
  pool.query = async () => ({
    rows: [
      {
        id: 5,
        name: "Admin",
        email: "admin@example.com",
        phone: null,
        photo_url: null,
        created_at: null,
        updated_at: null,
      },
    ],
  });

  const req = makeReq({ headers: { authorization: "Bearer valid" }, cookies: {} });
  const res = makeRes();
  let nextCalled = false;

  await protectModule.protectRoute(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.admin.id, 5);
});

test("authenticateDriver rejects malformed header", async () => {
  const req = makeReq({ headers: {}, cookies: {} });
  const res = makeRes();
  let nextCalled = false;

  await driverAuthModule.authenticateDriver(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.jsonBody.message, "Authorization header missing or malformed");
});

test("authenticateDriver rejects invalid token", async () => {
  jwt.verify = () => {
    throw new Error("bad token");
  };

  const req = makeReq({ headers: { authorization: "Bearer bad" }, cookies: {} });
  const res = makeRes();
  let nextCalled = false;

  await driverAuthModule.authenticateDriver(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.jsonBody.message, "Invalid or expired token");
});

test("authenticateDriver attaches driver and calls next", async () => {
  jwt.verify = () => ({ id: 12 });
  pool.query = async () => ({ rows: [{ id: 12, name: "Driver", email: "driver@example.com" }] });

  const req = makeReq({ headers: { authorization: "Bearer valid" }, cookies: {} });
  const res = makeRes();
  let nextCalled = false;

  await driverAuthModule.authenticateDriver(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.driver.id, 12);
});
