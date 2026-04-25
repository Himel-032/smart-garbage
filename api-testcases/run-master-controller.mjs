// Run: node api-testcases/run-master-controller.mjs api-testcases/env.sample.json api-testcases/credentials.sample.json
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const envPath = process.argv[2]
  ? path.resolve(root, process.argv[2])
  : path.resolve(root, "api-testcases", "env.sample.json");

const credentialsPath = process.argv[3]
  ? path.resolve(root, process.argv[3])
  : path.resolve(root, "api-testcases", "credentials.json");

const suites = [
  "cases.auth.controller.json",
  "cases.bins.controller.json",
  "cases.drivers.controller.json",
  "cases.messages.controller.json",
  "cases.analytics.controller.json",
];

let failedSuites = 0;

console.log("=========================================");
console.log("Master Controller Test Runner");
console.log("=========================================");
console.log(`Env: ${envPath}`);
console.log(`Credentials: ${credentialsPath}`);
console.log("");

for (const suite of suites) {
  const suitePath = path.resolve(root, "api-testcases", suite);
  console.log(`>>> Running ${suite}`);

  const result = spawnSync(
    process.execPath,
    [
      path.resolve(root, "api-testcases", "run-api-tests.mjs"),
      envPath,
      suitePath,
      credentialsPath,
    ],
    {
      stdio: "inherit",
      cwd: root,
    },
  );

  if (result.status !== 0) {
    failedSuites += 1;
  }

  console.log("");
}

console.log("=========================================");
console.log(`Total Suites: ${suites.length}`);
console.log(`Failed Suites: ${failedSuites}`);
console.log(`Final Verdict: ${failedSuites === 0 ? "ACCEPTED" : "FAILED"}`);
console.log("=========================================");

process.exit(failedSuites === 0 ? 0 : 2);
