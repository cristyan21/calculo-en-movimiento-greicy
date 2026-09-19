const EXPLAIN = {
  1: "Con 1 dedo calculamos el área. Mostramos la integral definida (con signo) y, si la curva cruza el eje x, el área geométrica sumando las partes positivas.",
  2: "Con 2 dedos giramos la región alrededor del eje x y calculamos el volumen por discos: V = π ∫ [f(x)]² dx.",
  3: "Con 3 dedos interpretamos el volumen al girar respecto al eje y con capas cilíndricas: V = 2π ∫ x f(x) dx.",
  4: "Con 4 dedos calculamos el área de la superficie de revolución sobre el eje asignado por la docente.",
  5: "Con 5 dedos medimos la longitud de arco de la curva en [a, b]: L = ∫ √(1+[f'(x)]²) dx.",
};

export function setExplainMode(visible, mode = 1) {
  const box = document.getElementById("explain-box");
  box.classList.toggle("visible", visible);
  box.textContent = EXPLAIN[mode] || "";
}

export function updateExplainForMode(mode, explainOn) {
  if (!explainOn) return;
  setExplainMode(true, mode);
}
