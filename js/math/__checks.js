/**
 * ARCHIVO: js/math/__checks.js
 * QUÉ ES: Autopruebas con integrales conocidas (verificación de precisión).
 * PARA EXPLICAR: Antes de la demo, el programa comprueba casos como
 * ∫_0^2 x² dx = 8/3 o la longitud de y=x en [0,1] = √2. Si pasan,
 * confían en que Simpson y las fórmulas están bien implementadas.
 * Se ejecutan en consola al abrir la app (F12) o con: npm run check:math
 */
import { compileFunction } from "./parser.js";
import { computeArea } from "./area.js";
import { computeVolume } from "./volume.js";
import { computeArcLength } from "./arc-length.js";
import { computeSurface } from "./surface.js";

function nearly(actual, expected, tol = 1e-3) {
  return Math.abs(actual - expected) <= tol;
}

export function runMathChecks() {
  const results = [];

  // ∫_0^2 x^2 dx = 8/3
  {
    const f = compileFunction("x^2");
    const area = computeArea(f, 0, 2, 1000);
    results.push({
      name: "área x^2 en [0,2]",
      ok: nearly(area.signedIntegral, 8 / 3, 1e-4),
      got: area.signedIntegral,
      expected: 8 / 3,
    });
  }

  // Geometric area of sin x on [0, 2π] = 4
  {
    const f = compileFunction("sin(x)");
    const area = computeArea(f, 0, 2 * Math.PI, 1200);
    results.push({
      name: "área geométrica sin(x) [0,2π]",
      ok: nearly(area.geometricArea, 4, 2e-2),
      got: area.geometricArea,
      expected: 4,
    });
  }

  // Volume of y=x around x-axis on [0,1]: π/3
  {
    const f = compileFunction("x");
    const vol = computeVolume(f, 0, 1, "x", 1000);
    results.push({
      name: "volumen discos y=x [0,1]",
      ok: nearly(vol.value, Math.PI / 3, 1e-3),
      got: vol.value,
      expected: Math.PI / 3,
    });
  }

  // Arc length of y=x on [0,1] = √2
  {
    const f = compileFunction("x");
    const arc = computeArcLength(f, 0, 1, 800);
    results.push({
      name: "arco y=x [0,1]",
      ok: nearly(arc.value, Math.SQRT2, 1e-3),
      got: arc.value,
      expected: Math.SQRT2,
    });
  }

  // Surface of y=x on [0,1] about x: π(√2) roughly? S=2π∫ x√2 dx = π√2
  {
    const f = compileFunction("x");
    const s = computeSurface(f, 0, 1, "x", 1000);
    results.push({
      name: "superficie y=x [0,1] eje x",
      ok: nearly(s.value, Math.PI * Math.SQRT2, 2e-2),
      got: s.value,
      expected: Math.PI * Math.SQRT2,
    });
  }

  return results;
}
