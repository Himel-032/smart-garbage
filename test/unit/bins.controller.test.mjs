import test from "node:test";
import assert from "node:assert/strict";
import { makeReq, makeRes, setupTestEnv } from "./test-utils.mjs";

setupTestEnv();

const poolModule = await import("../../backend/db.js");
const binsModule = await import("../../backend/controllers/bins.controller.js");

const pool = poolModule.default;
const original = {
  poolQuery: pool.query,
};

test.afterEach(() => {
  pool.query = original.poolQuery;
});

test("addBin creates a bin", async () => {
  pool.query = async () => ({ rows: [{ id: 1, name: "Bin 1" }] });

  const req = makeReq({ body: { name: "Bin 1", location: "Street", driver_id: 1, capacity: 100 } });
  const res = makeRes();

  await binsModule.addBin(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.jsonBody.success, true);
  assert.equal(res.jsonBody.bin.name, "Bin 1");
});

test("getAllBins returns rows", async () => {
  pool.query = async () => ({ rows: [{ id: 1, name: "Bin 1" }] });

  const req = makeReq();
  const res = makeRes();

  await binsModule.getAllBins(req, res);

  assert.equal(res.jsonBody[0].name, "Bin 1");
});

test("getAllUnassignedBins returns rows", async () => {
  pool.query = async () => ({ rows: [{ id: 2, name: "Bin 2" }] });

  const req = makeReq();
  const res = makeRes();

  await binsModule.getAllUnassignedBins(req, res);

  assert.equal(res.jsonBody[0].id, 2);
});

test("getBinById rejects invalid id", async () => {
  const req = makeReq({ params: { id: "abc" } });
  const res = makeRes();

  await binsModule.getBinById(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid bin ID");
});

test("getBinById returns 404 when bin is missing", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ params: { id: "1" } });
  const res = makeRes();

  await binsModule.getBinById(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Bin not found");
});

test("getBinById returns a bin", async () => {
  pool.query = async () => ({ rows: [{ id: 1, name: "Bin 1" }] });

  const req = makeReq({ params: { id: "1" } });
  const res = makeRes();

  await binsModule.getBinById(req, res);

  assert.equal(res.jsonBody.bin.id, 1);
});

test("deleteBin rejects invalid id", async () => {
  const req = makeReq({ params: { id: "abc" } });
  const res = makeRes();

  await binsModule.deleteBin(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid bin ID");
});

test("deleteBin returns 404 when bin is missing", async () => {
  pool.query = async () => ({ rowCount: 0, rows: [] });

  const req = makeReq({ params: { id: "1" } });
  const res = makeRes();

  await binsModule.deleteBin(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Bin not found");
});

test("deleteBin deletes a bin", async () => {
  pool.query = async () => ({ rowCount: 1, rows: [{ id: 1, name: "Bin 1" }] });

  const req = makeReq({ params: { id: "1" } });
  const res = makeRes();

  await binsModule.deleteBin(req, res);

  assert.equal(res.jsonBody.message, "Bin deleted successfully");
  assert.equal(res.jsonBody.bin.id, 1);
});

test("updateBin rejects invalid id", async () => {
  const req = makeReq({ params: { id: "abc" }, body: {} });
  const res = makeRes();

  await binsModule.updateBin(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid bin ID");
});

test("updateBin returns 404 when bin is missing", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ params: { id: "1" }, body: { name: "Updated" } });
  const res = makeRes();

  await binsModule.updateBin(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Bin not found");
});

test("updateBin updates bin", async () => {
  const queries = [
    { rows: [{ id: 1, name: "Bin 1", location: "Street", capacity: 100, current_level: 0, status: "active", latitude: null, longitude: null }] },
    { rows: [{ id: 1, name: "Updated Bin" }] },
  ];
  pool.query = async () => queries.shift();

  const req = makeReq({ params: { id: "1" }, body: { name: "Updated Bin" } });
  const res = makeRes();

  await binsModule.updateBin(req, res);

  assert.equal(res.jsonBody.message, "Bin updated successfully");
  assert.equal(res.jsonBody.bin.name, "Updated Bin");
});

test("receiveBinData rejects unauthorized requests", async () => {
  const req = makeReq({ headers: { authorization: "wrong" }, body: {} });
  const res = makeRes();

  await binsModule.receiveBinData(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.jsonBody.message, "Unauthorized");
});

test("receiveBinData returns 404 when bin is missing", async () => {
  pool.query = async () => ({ rows: [] });
  const req = makeReq({
    headers: { authorization: process.env.BIN_AUTH_TOKEN },
    body: { device_name: "Bin 1", weight_gm: 10, distance_cm: 10 },
  });
  const res = makeRes();

  await binsModule.receiveBinData(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonBody.message, "Bin not found");
});

test("receiveBinData returns no significant change when values are close", async () => {
  pool.query = async () => ({ rows: [{ current_level: 30 }] });
  const req = makeReq({
    headers: { authorization: process.env.BIN_AUTH_TOKEN },
    body: { device_name: "Bin 1", weight_gm: 0, distance_cm: 7 },
  });
  const res = makeRes();

  await binsModule.receiveBinData(req, res);

  assert.equal(res.jsonBody.status, "no significant change");
});

test("receiveBinData sends data to database when level changes", async () => {
  const queries = [
    { rows: [{ current_level: 0 }] },
    { rows: [] },
  ];
  pool.query = async () => queries.shift();

  const req = makeReq({
    headers: { authorization: process.env.BIN_AUTH_TOKEN },
    body: { device_name: "Bin 1", weight_gm: 1000, distance_cm: 0 },
  });
  const res = makeRes();

  await binsModule.receiveBinData(req, res);

  assert.equal(res.jsonBody.status, "send to database");
});

test("getAssignedBins returns assigned bins", async () => {
  pool.query = async () => ({ rows: [{ id: 1, name: "Bin 1" }] });

  const req = makeReq({ driver: { id: 3 } });
  const res = makeRes();

  await binsModule.getAssignedBins(req, res);

  assert.equal(res.jsonBody[0].name, "Bin 1");
});
