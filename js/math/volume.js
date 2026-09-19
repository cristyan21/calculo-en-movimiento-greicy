import { simpson } from "./integrate.js";

/**
 * Volume of solid of revolution.
 * axis "x": disks V = π ∫ [f(x)]^2 dx
 * axis "y": cylindrical shells V = 2π ∫ x f(x) dx  (assumes f(x)≥0 on [a,b], a≥0 preferred)
 */
export function computeVolume(f, a, b, axis = "x", n = 800) {
  const ax = axis === "y" ? "y" : "x";

  if (ax === "x") {
    const integrand = (x) => {
      const y = f(x);
      return y * y;
    };
    const res = simpson(integrand, a, b, n);
    const value = Math.PI * res.value;
    return {
      mode: "volume_x",
      title: "Volumen (revolución alrededor del eje x)",
      concept: "Método de discos",
      formula: "V = π ∫_a^b [f(x)]² dx",
      value,
      displayValue: value,
      unitsKey: "volume",
      method: `Discos + Simpson (n=${res.n})`,
      estimateError: res.estimateError != null ? Math.PI * res.estimateError : null,
      axis: "x",
      note: "Se gira la región bajo y = f(x) alrededor del eje x.",
    };
  }

  const integrand = (x) => x * f(x);
  const res = simpson(integrand, a, b, n);
  const value = 2 * Math.PI * res.value;
  return {
    mode: "volume_y",
    title: "Volumen (revolución alrededor del eje y)",
    concept: "Método de capas cilíndricas",
    formula: "V = 2π ∫_a^b x f(x) dx",
    value,
    displayValue: value,
    unitsKey: "volume",
    method: `Capas cilíndricas + Simpson (n=${res.n})`,
    estimateError: res.estimateError != null ? 2 * Math.PI * res.estimateError : null,
    axis: "y",
    note: "Para capas se asume interpretación estándar con radio x y altura f(x). Si la docente pide arandelas en y, se documenta el cambio de variable.",
  };
}
