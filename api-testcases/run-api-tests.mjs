import fs from "node:fs";
import path from "node:path";

const DEFAULT_TIMEOUT_MS = 10000;

function stripJsonComments(input) {
  let output = "";
  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const nextChar = input[i + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        output += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inString) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (char === "/" && nextChar === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }

    output += char;
  }

  return output;
}

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const withoutBom = raw.replace(/^\uFEFF/, "");
  const jsonText = stripJsonComments(withoutBom);
  return JSON.parse(jsonText);
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getTypeName(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function templateKeyToStateKey(key) {
  const normalized = key.trim();
  if (!normalized) return "";

  if (normalized.includes("_")) {
    const parts = normalized.toLowerCase().split("_").filter(Boolean);
    if (parts.length === 0) return "";
    return parts
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join("");
  }

  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

function getByPath(obj, dottedPath) {
  if (!dottedPath) return undefined;
  const parts = dottedPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function replaceVars(value, state) {
  if (typeof value === "string") {
    return value.replace(/\{\{([A-Z0-9_]+)\}\}/gi, (_, key) => {
      const envKey = templateKeyToStateKey(key);
      return state[envKey] ?? "";
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceVars(item, state));
  }

  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = replaceVars(v, state);
    }
    return out;
  }

  return value;
}

function normalizeHeaders(headers = {}) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k.toLowerCase()] = v;
  }
  return out;
}

async function executeCase(baseUrl, testCase, env) {
  const input = replaceVars(testCase.input || {}, env);
  const expected = replaceVars(testCase.expectedOutput || {}, env);

  const method = (input.method || "GET").toUpperCase();
  const pathPart = input.path || "/";
  const url = `${baseUrl.replace(/\/$/, "")}${pathPart}`;
  const headers = normalizeHeaders(input.headers || {});

  if (input.auth === "admin" && env.adminToken) {
    headers.authorization = `Bearer ${env.adminToken}`;
  }
  if (input.auth === "driver" && env.driverToken) {
    headers.authorization = `Bearer ${env.driverToken}`;
  }
  if (input.auth === "device" && env.binDeviceAuthToken) {
    headers.authorization = env.binDeviceAuthToken;
  }

  const requestInit = { method, headers };

  if (input.body !== undefined) {
    if (!requestInit.headers["content-type"]) {
      requestInit.headers["content-type"] = "application/json";
    }
    requestInit.body = JSON.stringify(input.body);
  }

  const timeoutMs = input.timeoutMs || DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  let rawText = "";
  let parsedBody = null;
  let runtimeError = null;

  try {
    response = await fetch(url, { ...requestInit, signal: controller.signal });
    rawText = await response.text();
    parsedBody = safeJsonParse(rawText);
  } catch (err) {
    runtimeError = err;
  } finally {
    clearTimeout(timeout);
  }

  const errors = [];

  if (runtimeError) {
    errors.push(`Request failed: ${runtimeError.message}`);
    return {
      ok: false,
      status: null,
      responseBody: rawText,
      responseJson: parsedBody,
      errors,
    };
  }

  if (typeof expected.status === "number" && response.status !== expected.status) {
    errors.push(`Expected status ${expected.status}, got ${response.status}`);
  }

  if (Array.isArray(expected.oneOfStatus) && !expected.oneOfStatus.includes(response.status)) {
    errors.push(
      `Expected status to be one of [${expected.oneOfStatus.join(", ")}], got ${response.status}`,
    );
  }

  if (typeof expected.bodyIncludes === "string" && !rawText.includes(expected.bodyIncludes)) {
    errors.push(`Expected response body to include \"${expected.bodyIncludes}\"`);
  }

  if (expected.jsonIncludes && typeof expected.jsonIncludes === "object") {
    if (!parsedBody || typeof parsedBody !== "object") {
      errors.push("Expected JSON response body but body is not JSON");
    } else {
      for (const [key, expectedValue] of Object.entries(expected.jsonIncludes)) {
        const actual = getByPath(parsedBody, key);
        if (actual !== expectedValue) {
          errors.push(
            `Expected jsonIncludes ${key} = ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actual)}`,
          );
        }
      }
    }
  }

  if (Array.isArray(expected.jsonPathExists)) {
    if (!parsedBody || typeof parsedBody !== "object") {
      errors.push("Expected JSON response body but body is not JSON");
    } else {
      for (const keyPath of expected.jsonPathExists) {
        const actual = getByPath(parsedBody, keyPath);
        if (actual === undefined) {
          errors.push(`Expected JSON path to exist: ${keyPath}`);
        }
      }
    }
  }

  if (expected.jsonPathTypes && typeof expected.jsonPathTypes === "object") {
    if (!parsedBody || typeof parsedBody !== "object") {
      errors.push("Expected JSON response body but body is not JSON");
    } else {
      for (const [keyPath, expectedType] of Object.entries(expected.jsonPathTypes)) {
        const actual = getByPath(parsedBody, keyPath);
        const actualType = getTypeName(actual);
        if (actual === undefined) {
          errors.push(`Expected JSON path to exist for type check: ${keyPath}`);
        } else if (actualType !== expectedType) {
          errors.push(`Expected type of ${keyPath} = ${expectedType}, got ${actualType}`);
        }
      }
    }
  }

  const captured = {};
  if (testCase.capture && typeof testCase.capture === "object") {
    if (!parsedBody || typeof parsedBody !== "object") {
      errors.push("Cannot capture values because response body is not JSON");
    } else {
      for (const [stateKey, jsonPath] of Object.entries(testCase.capture)) {
        const capturedValue = getByPath(parsedBody, jsonPath);
        if (capturedValue === undefined) {
          errors.push(`Capture failed: path ${jsonPath} not found`);
        } else {
          captured[stateKey] = capturedValue;
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    status: response.status,
    responseBody: rawText,
    responseJson: parsedBody,
    errors,
    captured,
  };
}

async function main() {
  const root = process.cwd();
  const envPath = process.argv[2]
    ? path.resolve(root, process.argv[2])
    : path.resolve(root, "api-testcases", "env.json");

  const casesPath = process.argv[3]
    ? path.resolve(root, process.argv[3])
    : path.resolve(root, "api-testcases", "cases.sample.json");

  const credentialsPath = process.argv[4]
    ? path.resolve(root, process.argv[4])
    : path.resolve(root, "api-testcases", "credentials.json");

  if (!fs.existsSync(envPath)) {
    console.error(`Missing env file: ${envPath}`);
    console.error("Copy api-testcases/env.sample.json to api-testcases/env.json and fill values.");
    process.exit(1);
  }

  if (!fs.existsSync(casesPath)) {
    console.error(`Missing test case file: ${casesPath}`);
    process.exit(1);
  }

  const credentialsPathProvided = Boolean(process.argv[4]);
  if (credentialsPathProvided && !fs.existsSync(credentialsPath)) {
    console.error(`Missing credentials file: ${credentialsPath}`);
    process.exit(1);
  }

  const env = loadJson(envPath);
  const state = { ...env };
  const hasCredentials = fs.existsSync(credentialsPath);
  if (hasCredentials) {
    const credentials = loadJson(credentialsPath);
    Object.assign(state, credentials);
  }
  const testCases = loadJson(casesPath);

  if (!Array.isArray(testCases) || testCases.length === 0) {
    console.error("No test cases found. cases JSON must be a non-empty array.");
    process.exit(1);
  }

  const baseUrl = env.baseUrl;
  if (!baseUrl) {
    console.error("env.json must contain baseUrl.");
    process.exit(1);
  }

  let passed = 0;

  console.log("=========================================");
  console.log("API Judge Runner (Codeforces Style)");
  console.log("=========================================");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Credentials: ${hasCredentials ? credentialsPath : "not loaded"}`);
  console.log(`Total Cases: ${testCases.length}`);
  console.log("");

  for (let i = 0; i < testCases.length; i += 1) {
    const tc = testCases[i];
    const label = `Case #${i + 1}`;
    const result = await executeCase(baseUrl, tc, state);

    if (result.ok) {
      passed += 1;
      console.log(`${label}: PASS - ${tc.name}`);
      if (result.captured && Object.keys(result.captured).length > 0) {
        Object.assign(state, result.captured);
        const capturedKeys = Object.keys(result.captured).join(", ");
        console.log(`  - Captured: ${capturedKeys}`);
      }
    } else {
      console.log(`${label}: FAIL - ${tc.name}`);
      for (const err of result.errors) {
        console.log(`  - ${err}`);
      }
      if (result.responseBody) {
        console.log(`  - Response body: ${result.responseBody}`);
      }
    }
  }

  const failed = testCases.length - passed;
  console.log("");
  console.log("=========================================");
  console.log(`Score: ${passed}/${testCases.length}`);
  console.log(`Verdict: ${failed === 0 ? "ACCEPTED" : "FAILED"}`);
  console.log("=========================================");

  process.exit(failed === 0 ? 0 : 2);
}

main().catch((err) => {
  console.error("Runner crashed:", err);
  process.exit(1);
});
