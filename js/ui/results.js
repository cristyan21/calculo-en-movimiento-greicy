/**
 * ARCHIVO: js/ui/results.js
 * QUÉ ES: Panel de “Resultado” (fórmula, valor, unidades, notas).
 * PARA EXPLICAR: Muestra lo que la profesora quiere ver: concepto, integral,
 * número con unidades y, en el área, integral con signo vs área geométrica.
 * Es la parte más importante para la exposición de cálculo.
 */
function formatNumber(value) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-4 || abs >= 1e6)) return value.toExponential(4);
  return value.toLocaleString("es-CO", { maximumFractionDigits: 6 });
}

export function renderResults(result, assignment) {
  const units = assignment.units?.[result.unitsKey] || "";
  document.getElementById("result-title").textContent = result.title;
  document.getElementById("result-concept").textContent = result.concept;
  document.getElementById("result-formula").textContent = result.formula;
  document.getElementById("result-value").textContent =
    `${formatNumber(result.displayValue)} ${units}`.trim();
  document.getElementById("result-method").textContent = result.method || "";
  document.getElementById("result-note").textContent = result.note || "";

  const extra = document.getElementById("result-extra");
  if (result.mode === "area") {
    extra.innerHTML = `
      <div><dt>Integral con signo</dt><dd>${formatNumber(result.signedIntegral)} ${units}</dd></div>
      <div><dt>Área geométrica</dt><dd>${formatNumber(result.geometricArea)} ${units}</dd></div>
      <div><dt>Raíces detectadas</dt><dd>${result.roots?.length ? result.roots.map(formatNumber).join(", ") : "ninguna"}</dd></div>
    `;
    extra.classList.remove("hidden");
  } else {
    extra.innerHTML = "";
    extra.classList.add("hidden");
  }

  if (result.estimateError != null) {
    document.getElementById("result-error").textContent =
      `Error estimado (n vs 2n): ${formatNumber(result.estimateError)}`;
  } else {
    document.getElementById("result-error").textContent = "";
  }
}

export function clearResults() {
  document.getElementById("result-title").textContent = "Sin cálculo aún";
  document.getElementById("result-concept").textContent = "Elige un gesto o botón (1–5)";
  document.getElementById("result-formula").textContent = "—";
  document.getElementById("result-value").textContent = "—";
  document.getElementById("result-method").textContent = "";
  document.getElementById("result-note").textContent = "";
  document.getElementById("result-error").textContent = "";
  document.getElementById("result-extra").classList.add("hidden");
}
