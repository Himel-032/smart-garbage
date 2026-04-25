import test from "node:test";
import assert from "node:assert/strict";
import { makeReq, makeRes, setupTestEnv } from "./test-utils.mjs";

setupTestEnv();

const poolModule = await import("../../backend/db.js");
const bcryptModule = await import("../../backend/node_modules/bcryptjs/index.js");
const driverModule = await import("../../backend/controllers/drivers.controller.js");

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

test("loginDriver rejects missing credentials", async () => {
  const req = makeReq({ body: { email: "", password: "" } });
  const res = makeRes();

  await driverModule.loginDriver(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Email and Password required");
});

test("loginDriver rejects inactive or missing driver", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ body: { email: "driver@example.com", password: "secret" } });
  const res = makeRes();

  await driverModule.loginDriver(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Driver not found or status is not active");
});

test("loginDriver rejects invalid credentials", async () => {
  pool.query = async () => ({ rows: [{ id: 1, email: "driver@example.com", password: "hash" }] });
  bcrypt.compare = async () => false;

  const req = makeReq({ body: { email: "driver@example.com", password: "wrong" } });
  const res = makeRes();

  await driverModule.loginDriver(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.jsonBody.message, "Invalid credentials");
});

test("loginDriver returns token on success", async () => {
  pool.query = async () => ({
    rows: [{ id: 2, email: "driver@example.com", password: "hash", name: "Driver", status: "active" }],
  });
  bcrypt.compare = async () => true;

  const req = makeReq({ body: { email: "driver@example.com", password: "secret" } });
  const res = makeRes();

  await driverModule.loginDriver(req, res);

  assert.equal(res.jsonBody.message, "Login successful");
  assert.equal(typeof res.jsonBody.token, "string");
});

test("driverHome returns driver data", async () => {
  pool.query = async () => ({ rows: [{ id: 3, name: "Driver", email: "driver@example.com" }] });

  const req = makeReq({ driver: { id: 3 } });
  const res = makeRes();

  await driverModule.driverHome(req, res);

  assert.equal(res.jsonBody.message, "Welcome Driver");
  assert.equal(res.jsonBody.driver.id, 3);
});

test("logoutDriver returns success message", async () => {
  const req = makeReq();
  const res = makeRes();

  await driverModule.logoutDriver(req, res);

  assert.equal(res.jsonBody.message, "Driver logged out successfully. Please delete the token on the client.");
});

test("driverForgotPassword rejects missing driver", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ body: { email: "missing@example.com" } });
  const res = makeRes();

  await driverModule.driverForgotPassword(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Driver not found or status is not active");
});

test("driverResetPassword rejects invalid token", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ params: { token: "invalid" }, body: { newPassword: "newpass" } });
  const res = makeRes();

  await driverModule.driverResetPassword(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid or expired token");
});

test("validateDriverResetToken rejects invalid token", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ params: { token: "invalid" } });
  const res = makeRes();

  await driverModule.validateDriverResetToken(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid or expired token");
});

test("getAllDrivers returns rows", async () => {
  pool.query = async () => ({ rows: [{ id: 1, name: "Driver 1", assigned_bins: "2" }] });

  const req = makeReq();
  const res = makeRes();

  await driverModule.getAllDrivers(req, res);

  assert.equal(res.jsonBody[0].name, "Driver 1");
});

test("getDriverById rejects invalid id", async () => {
  const req = makeReq({ params: { id: "abc" } });
  const res = makeRes();

  await driverModule.getDriverById(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid driver ID");
});

test("getDriverById returns 404 when driver is missing", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ params: { id: "1" } });
  const res = makeRes();

  await driverModule.getDriverById(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Driver not found");
});

test("createDriver rejects missing required fields", async () => {
  const req = makeReq({ body: { name: "" } });
  const res = makeRes();

  await driverModule.createDriver(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Name, Email, Password required");
});

test("createDriver creates driver successfully", async () => {
  bcrypt.hash = async () => "hashed-pass";
  pool.query = async () => ({
    rows: [{ id: 9, name: "New Driver", email: "driver@example.com", status: "pending" }],
  });

  const req = makeReq({ body: { name: "New Driver", phone: "123", email: "driver@example.com", password: "secret" } });
  const res = makeRes();

  await driverModule.createDriver(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.jsonBody.message, "Driver created successfully");
  assert.equal(res.jsonBody.driver.name, "New Driver");
});

test("updateDriver rejects invalid id", async () => {
  const req = makeReq({ params: { id: "abc" }, body: {} });
  const res = makeRes();

  await driverModule.updateDriver(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid driver ID");
});

test("updateDriver returns 404 when driver is missing", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ params: { id: "1" }, body: { name: "Updated" } });
  const res = makeRes();

  await driverModule.updateDriver(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Driver not found");
});

test("updateDriver updates driver successfully", async () => {
  const queries = [{ rows: [{ id: 1, name: "Updated Driver", email: "driver@example.com" }] }];
  pool.query = async () => queries.shift();

  const req = makeReq({ params: { id: "1" }, body: { name: "Updated Driver" } });
  const res = makeRes();

  await driverModule.updateDriver(req, res);

  assert.equal(res.jsonBody.message, "Driver updated successfully");
  assert.equal(res.jsonBody.driver.name, "Updated Driver");
});

test("assignBins rejects missing fields", async () => {
  const req = makeReq({ body: { driver_id: null, bin_ids: null } });
  const res = makeRes();

  await driverModule.assignBins(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "driver_id and bin_ids are required");
});

test("assignBins succeeds with valid payload", async () => {
  pool.query = async () => ({ rowCount: 1, rows: [] });

  const req = makeReq({ body: { driver_id: 2, bin_ids: [1, 2] } });
  const res = makeRes();

  await driverModule.assignBins(req, res);

  assert.equal(res.jsonBody.message, "Bins assigned successfully");
});

test("deleteDriver rejects invalid id", async () => {
  const req = makeReq({ params: { id: "abc" } });
  const res = makeRes();

  await driverModule.deleteDriver(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid driver ID");
});

test("deleteDriver returns 404 when driver is missing", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ params: { id: "1" } });
  const res = makeRes();

  await driverModule.deleteDriver(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Driver not found");
});

test("deleteDriver succeeds when driver exists", async () => {
  const queries = [
    { rows: [{ photo_url: null }] },
    { rows: [] },
  ];
  pool.query = async () => queries.shift();

  const req = makeReq({ params: { id: "1" } });
  const res = makeRes();

  await driverModule.deleteDriver(req, res);

  assert.equal(res.jsonBody.message, "Driver deleted successfully");
});
