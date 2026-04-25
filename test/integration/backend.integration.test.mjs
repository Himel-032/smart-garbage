import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

const rootDir = path.resolve(".");
const backendDir = path.join(rootDir, "backend");
const port = 5051;
const baseUrl = `http://localhost:${port}`;
let backendProcess;

async function waitForServer(url, timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // keep polling until backend is ready
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Backend did not start within ${timeoutMs}ms`);
}

function startBackend() {
  const env = {
    ...process.env,
    PORT: String(port),
  };

  backendProcess = spawn(process.execPath, ["server.js"], {
    cwd: backendDir,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  backendProcess.stdout.on("data", (data) => {
    process.stdout.write(data);
  });
  backendProcess.stderr.on("data", (data) => {
    process.stderr.write(data);
  });
}

async function stopBackend() {
  if (!backendProcess) return;

  backendProcess.kill();
  await new Promise((resolve) => {
    backendProcess.once("exit", resolve);
  });
}

test.before(async () => {
  await fs.access(path.join(backendDir, "server.js"));
  startBackend();
  await waitForServer(`${baseUrl}/`);
});

test.after(async () => {
  await stopBackend();
});

test("GET / returns backend health text", async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /Smart Garbage Management System Backend is running/i);
});

test("GET /api/auth/me without token is rejected", async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, "Unauthorized: No token provided");
});

test("GET /api/bins without token is rejected", async () => {
  const response = await fetch(`${baseUrl}/api/bins`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, "Unauthorized: No token provided");
});

test("GET /api/drivers/home without token is rejected", async () => {
  const response = await fetch(`${baseUrl}/api/drivers/home`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, "Authorization header missing or malformed");
});

test("GET /api/messages/conversations without token is rejected", async () => {
  const response = await fetch(`${baseUrl}/api/messages/conversations`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, "Unauthorized: No token provided");
});

test("GET /api/analytics/top without token is rejected", async () => {
  const response = await fetch(`${baseUrl}/api/analytics/top`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, "Unauthorized: No token provided");
});
