import { simpson } from "./integrate.js";
import { derivative } from "./parser.js";

/**
 * Arc length L = ∫_a^b √(1+[f'(x)]²) dx
 */
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
