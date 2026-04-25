import test from "node:test";
import assert from "node:assert/strict";
import { makeReq, makeRes, setupTestEnv } from "./test-utils.mjs";

setupTestEnv();

const poolModule = await import("../../backend/db.js");
const messageModule = await import("../../backend/controllers/message.controller.js");
const analyticsModule = await import("../../backend/controllers/analytics.controller.js");

const pool = poolModule.default;
const original = {
  poolQuery: pool.query,
};

test.afterEach(() => {
  pool.query = original.poolQuery;
});

test("searchDrivers returns matched drivers", async () => {
  pool.query = async () => ({ rows: [{ id: 1, name: "Driver One" }] });

  const req = makeReq({ query: { search: "Driver" } });
  const res = makeRes();

  await messageModule.searchDrivers(req, res);

  assert.equal(res.jsonBody.data[0].name, "Driver One");
});

test("getConversations returns admin conversations", async () => {
  pool.query = async () => ({ rows: [{ id: 1, name: "Driver One" }] });

  const req = makeReq({ admin: { id: 1 } });
  const res = makeRes();

  await messageModule.getConversations(req, res);

  assert.equal(res.jsonBody.data[0].name, "Driver One");
});

test("getDriverConversations returns driver conversations", async () => {
  pool.query = async () => ({ rows: [{ id: 1, name: "Admin One" }] });

  const req = makeReq({ driver: { id: 2 } });
  const res = makeRes();

  await messageModule.getDriverConversations(req, res);

  assert.equal(res.jsonBody.data[0].name, "Admin One");
});

test("getMessages returns a conversation thread", async () => {
  pool.query = async () => ({ rows: [{ id: 1, content: "hello" }] });

  const req = makeReq({ query: { user_role: "admin", user_id: 1, other_role: "driver", other_id: 2 } });
  const res = makeRes();

  await messageModule.getMessages(req, res);

  assert.equal(res.jsonBody.data[0].content, "hello");
});

test("sendMessage rejects unauthorized request", async () => {
  const req = makeReq({ body: { receiver_role: "driver", receiver_id: 1, content: "hello" } });
  const res = makeRes();

  await messageModule.sendMessage(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.jsonBody.message, "Unauthorized: No sender found");
});

test("sendMessage stores admin message", async () => {
  pool.query = async () => ({ rows: [{ id: 1, content: "hello" }] });

  const req = makeReq({
    admin: { id: 1 },
    body: { receiver_role: "driver", receiver_id: 2, content: "hello" },
  });
  const res = makeRes();

  await messageModule.sendMessage(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.jsonBody.message, "Message sent");
  assert.equal(res.jsonBody.data.content, "hello");
});

test("sendMessage stores driver message", async () => {
  pool.query = async () => ({ rows: [{ id: 2, content: "hi" }] });

  const req = makeReq({
    driver: { id: 2 },
    body: { receiver_role: "admin", receiver_id: 1, content: "hi" },
  });
  const res = makeRes();

  await messageModule.sendMessage(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.jsonBody.data.content, "hi");
});

test("markMessagesAsRead marks messages as read", async () => {
  pool.query = async () => ({ rows: [] });

  const req = makeReq({ admin: { id: 1 }, body: { driver_id: 2 } });
  const res = makeRes();

  await messageModule.markMessagesAsRead(req, res);

  assert.equal(res.jsonBody.message, "Messages marked as read");
});

test("getBinAnalytics rejects invalid bin id", async () => {
  const req = makeReq({ params: { binId: "abc" }, query: {} });
  const res = makeRes();

  await analyticsModule.getBinAnalytics(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid bin ID");
});

test("getBinAnalytics rejects invalid range", async () => {
  const req = makeReq({ params: { binId: "1" }, query: { range: "yearly" } });
  const res = makeRes();

  await analyticsModule.getBinAnalytics(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid range parameter");
});

test("getBinAnalytics returns data", async () => {
  pool.query = async () => ({ rows: [{ period: "2026-04-01", fill: 50 }] });

  const req = makeReq({ params: { binId: "1" }, query: { range: "daily" } });
  const res = makeRes();

  await analyticsModule.getBinAnalytics(req, res);

  assert.equal(res.jsonBody.binId, 1);
  assert.equal(res.jsonBody.range, "daily");
  assert.equal(res.jsonBody.data[0].fill, 50);
});

test("getAllBinsAnalytics rejects invalid range", async () => {
  const req = makeReq({ query: { range: "yearly" } });
  const res = makeRes();

  await analyticsModule.getAllBinsAnalytics(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Invalid range parameter");
});

test("getAllBinsAnalytics returns data", async () => {
  pool.query = async () => ({ rows: [{ period: "2026-04-01", fill: 60 }] });

  const req = makeReq({ query: { range: "monthly" } });
  const res = makeRes();

  await analyticsModule.getAllBinsAnalytics(req, res);

  assert.equal(res.jsonBody.range, "monthly");
  assert.equal(res.jsonBody.data[0].fill, 60);
});

test("getTopBinsAnalytics returns top bins", async () => {
  pool.query = async () => ({ rows: [{ bin_id: 1, bin_name: "Bin 1", avg_fill: 70 }] });

  const req = makeReq({ query: { top: "5" } });
  const res = makeRes();

  await analyticsModule.getTopBinsAnalytics(req, res);

  assert.equal(res.jsonBody.top, 5);
  assert.equal(res.jsonBody.data[0].bin_name, "Bin 1");
});
