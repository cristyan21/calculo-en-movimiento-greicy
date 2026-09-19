import { runMathChecks } from "../js/math/__checks.js";

const results = runMathChecks();
console.table(results);
const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error("FAILED", failed);
  process.exit(1);
}
console.log("All math checks passed");
