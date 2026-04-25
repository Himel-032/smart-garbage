export function setupTestEnv() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
  process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
  process.env.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "SG.test-sendgrid-key";
  process.env.GMAIL_USER = process.env.GMAIL_USER || "noreply@example.com";
  process.env.BIN_AUTH_TOKEN = process.env.BIN_AUTH_TOKEN || "device-token";
  process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "test-cloud";
  process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "test-key";
  process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "test-secret";
}

export function makeReq(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    secure: false,
    ...overrides,
  };
}

export function makeRes() {
  return {
    statusCode: 0,
    jsonBody: undefined,
    sendBody: undefined,
    cookieCalls: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.jsonBody = payload;
      return this;
    },
    send(payload) {
      this.sendBody = payload;
      return this;
    },
    cookie(...args) {
      this.cookieCalls.push(args);
      return this;
    },
  };
}

export function snapshotRestorers(modules) {
  const snapshots = new Map();
  for (const [name, moduleObject] of Object.entries(modules)) {
    const current = {};
    for (const key of Object.keys(moduleObject)) {
      if (typeof moduleObject[key] === "function") {
        current[key] = moduleObject[key];
      }
    }
    snapshots.set(name, current);
  }
  return snapshots;
}

export function restoreRestorers(modules, snapshots) {
  for (const [name, originalMethods] of snapshots.entries()) {
    const moduleObject = modules[name];
    for (const [key, value] of Object.entries(originalMethods)) {
      moduleObject[key] = value;
    }
  }
}
