/**
 * ARCHIVO: js/math/arc-length.js
 * QUÉ ES: Cálculo del gesto 5 — longitud de arco.
 * PARA EXPLICAR: Mide cuánto “mide” la curva entre a y b:
 *   L = ∫_a^b √(1+[f'(x)]²) dx
 * Concepto geométrico distinto del área: no sombrea región, recorre la curva.
 */
import { simpson } from "./integrate.js";
import { derivative } from "./parser.js";

export function computeArcLength(f, a, b, n = 800) {
  const integrand = (x) => {
    const dy = derivative(f, x);
    return Math.sqrt(1 + dy * dy);
  };
  const res = simpson(integrand, a, b, n);
  return {
    mode: "arc",
    title: "Longitud de arco",
    concept: "Longitud de la curva en [a, b]",
    formula: "L = ∫_a^b √(1+[f'(x)]²) dx",
    value: res.value,
    displayValue: res.value,
    unitsKey: "arc",
    method: `Simpson (n=${res.n}) + derivada numérica centrada`,
    estimateError: res.estimateError,
    note: "Se resalta la curva entre a y b y se calcula su longitud.",
  };
}
