/**
 * ARCHIVO: scripts/check-math.mjs
 * QUÉ ES: Script de terminal para validar la matemática sin abrir el navegador.
 * PARA EXPLICAR: Ejecutar `npm run check:math` o `node scripts/check-math.mjs`.
 * Si todas las pruebas pasan, los cálculos del software coinciden con valores
 * teóricos conocidos (útil antes de la sustentación).
 */
import { runMathChecks } from "../js/math/__checks.js";

const results = runMathChecks();
console.table(results);
const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error("FAILED", failed);
  process.exit(1);
}
console.log("All math checks passed");
