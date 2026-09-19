import { simpson } from "./integrate.js";
import { findRoots } from "./roots.js";

/**
 * Signed definite integral and geometric area (sum of absolute pieces).
 */
export function computeArea(f, a, b, n = 800) {
  const signed = simpson(f, a, b, n);
  const roots = findRoots(f, a, b);
  const points = [a, ...roots.filter((r) => r > a && r < b), b];

  let geometric = 0;
  const pieces = [];
  for (let i = 0; i < points.length - 1; i++) {
    const left = points[i];
    const right = points[i + 1];
    if (right - left < 1e-12) continue;
    const mid = 0.5 * (left + right);
    const piece = simpson(f, left, right, Math.max(40, Math.floor(n / points.length)));
    const absPiece = Math.abs(piece.value);
    geometric += absPiece;
    pieces.push({
      from: left,
      to: right,
      signed: piece.value,
      geometric: absPiece,
      above: f(mid) >= 0,
    });
  }

  return {
    mode: "area",
    title: "Área bajo la curva",
    concept: "Integral definida y área geométrica",
    formula: "∫_a^b f(x) dx   |   área geométrica = Σ |∫| en subintervalos",
    signedIntegral: signed.value,
    geometricArea: geometric,
    value: geometric,
    displayValue: geometric,
    unitsKey: "area",
    method: `Simpson compuesto (n=${signed.n})`,
    estimateError: signed.estimateError,
    roots,
    pieces,
    note:
      roots.length > 0
        ? "La función cruza el eje x: se reporta la integral con signo y el área geométrica total (suma de áreas positivas)."
        : "En este intervalo la curva no cambia de signo de forma detectada; el área geométrica coincide con |∫|.",
  };
}
