# API Testcases (Codeforces Style)

This folder is fully separate from your backend/frontend code.

It lets you define API tests as:
- input: HTTP method, path, headers, body
- expectedOutput: status and response checks

Then run all cases and get PASS/FAIL + final score.

## 1) Setup

1. Keep your backend running (example):

```bash
cd backend
npm run dev
```

2. Copy sample env file:

```bash
cd ..
copy api-testcases\\env.sample.json api-testcases\\env.json
```

3. Copy sample credentials file:

```bash
copy api-testcases\\credentials.sample.json api-testcases\\credentials.json
```

4. Edit `api-testcases/env.json`:
- `baseUrl`: your backend URL
- `testBinId`: bin id used in some GET tests
- `testDriverId`: driver id used in some GET tests
- `analyticsTop`: top count used in analytics tests
- `binDeviceAuthToken`: device auth token for `/api/bins/data`

5. Edit `api-testcases/credentials.json`:
- `adminEmail`
- `adminPassword`
- `driverEmail`
- `driverPassword`
- `driverSearchKeyword`

## 2) Run Tests

From project root:

```bash
node api-testcases/run-api-tests.mjs
```

Run the read-only GET suite (no POST/PUT/DELETE):

```bash
node api-testcases/run-api-tests.mjs api-testcases/env.sample.json api-testcases/cases.get-only.json
```

Run controller-wise suites (login + controller GETs + logout):

```bash
node api-testcases/run-api-tests.mjs api-testcases/env.sample.json api-testcases/cases.auth.controller.json api-testcases/credentials.sample.json
node api-testcases/run-api-tests.mjs api-testcases/env.sample.json api-testcases/cases.bins.controller.json api-testcases/credentials.sample.json
node api-testcases/run-api-tests.mjs api-testcases/env.sample.json api-testcases/cases.drivers.controller.json api-testcases/credentials.sample.json
node api-testcases/run-api-tests.mjs api-testcases/env.sample.json api-testcases/cases.messages.controller.json api-testcases/credentials.sample.json
node api-testcases/run-api-tests.mjs api-testcases/env.sample.json api-testcases/cases.analytics.controller.json api-testcases/credentials.sample.json
```

Run all controller suites in one command:

```bash
node api-testcases/run-master-controller.mjs api-testcases/env.sample.json api-testcases/credentials.sample.json
```

Custom files:

```bash
node api-testcases/run-api-tests.mjs api-testcases/env.json api-testcases/cases.sample.json
```

## 3) Test Case Format

Each case entry:

```json
{
  "name": "Case title",
  "input": {
    "method": "GET",
    "path": "/api/example",
    "auth": "admin",
    "headers": {
      "x-custom": "value"
    },
    "body": {
      "foo": "bar"
    }
  },
  "expectedOutput": {
    "status": 200,
    "bodyIncludes": "success",
    "jsonIncludes": {
      "message": "ok",
      "data.id": 1
    }
  }
}
```

### Supported `auth`
- `admin`: injects `Authorization: Bearer <adminToken>`
- `driver`: injects `Authorization: Bearer <driverToken>`
- `device`: injects `Authorization: <binDeviceAuthToken>`

### Supported `expectedOutput`
- `status`: exact HTTP status
- `oneOfStatus`: array of acceptable HTTP status values
- `bodyIncludes`: substring in response text
- `jsonIncludes`: key/value checks (supports dot path like `data.id`)
- `jsonPathExists`: array of JSON paths that must exist
- `jsonPathTypes`: object map of JSON path to expected type (`string`, `number`, `array`, `object`, `boolean`, `null`)

### Capture values from responses

Each case can capture values (for example login token) and reuse them in later cases:

```json
{
  "capture": {
    "adminToken": "token",
    "adminId": "admin.id"
  }
}
```

Then reference them later with template variables:

```json
{
  "input": {
    "path": "/api/messages/admin?user_id={{ADMIN_ID}}"
  }
}
```

## 4) Notes

- This runner does not modify your existing code.
- You can create multiple case files, e.g. `cases.auth.json`, `cases.bins.json`.
- If backend is down, cases fail with connection errors.
- The `cases.get-only.json` file tests GET routes only and avoids write operations.
- Testcase files can include `//` comments (used for top-of-file run commands).

## 5) Fill Required Values

Edit `api-testcases/credentials.json` and fill:

- `adminEmail`
- `adminPassword`
- `driverEmail`
- `driverPassword`
- `driverSearchKeyword`

Edit `api-testcases/env.json` and fill:

- `testBinId`
- `testDriverId`
- `analyticsTop`

Notes:
- `adminId` and `driverId` can stay as defaults because messages suite captures IDs after login.
- `adminToken` and `driverToken` can stay empty; controller suites generate/capture fresh tokens from login.
