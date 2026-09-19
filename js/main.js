import { loadConfig, applyTheme } from "./config-loader.js";
import { runMode, MODES, sampleCurve } from "./math/index.js";
import { runMathChecks } from "./math/__checks.js";
import { showPlotForMode, renderPlot2D } from "./viz/plot-2d.js";
import { createGestureEngine } from "./gesture-engine.js";
import { bindShell, setActiveMode, hideWelcome, showToast } from "./ui/shell.js";
import { renderResults, clearResults } from "./ui/results.js";
import { setExplainMode, updateExplainForMode } from "./ui/instructions.js";

let assignment = null;
let theme = null;
let currentMode = null;
let explainOn = false;
let gestureEngine = null;

function setStatus(text) {
  const el = document.getElementById("status-text");
  if (el) el.textContent = text;
}

function applyMode(mode, source = "manual") {
  try {
    const result = runMode(mode, assignment);
    currentMode = mode;
    setActiveMode(mode);
    renderResults(result, assignment);
    showPlotForMode(mode, assignment, result);
    updateExplainForMode(mode, explainOn);
    showToast(
      source === "gesture"
        ? `Gesto: ${mode} → ${MODES[mode].short}`
        : `Modo ${mode}: ${MODES[mode].short}`
    );
    setStatus(`Modo activo: ${MODES[mode].short}`);
  } catch (err) {
    console.error(err);
    showToast(err.message || "Error en el cálculo");
    setStatus(err.message || "Error en el cálculo");
  }
}

function resetApp() {
  currentMode = null;
  clearResults();
  document.querySelectorAll("[data-mode]").forEach((b) => b.classList.remove("active"));
  const chip = document.getElementById("gesture-chip");
  chip.textContent = "Esperando gesto o botón";
  chip.classList.remove("ok");
  gestureEngine?.resetStability();
  renderPlot2D(assignment, null, "plot2d");
  document.getElementById("plot3d").classList.add("hidden");
  document.getElementById("plot2d").classList.remove("hidden");
  setStatus("Reiniciado — elige 1 a 5");
  showToast("Aplicación reiniciada");
}

async function startCamera() {
  hideWelcome();
  const video = document.getElementById("webcam");
  try {
    await gestureEngine.start(video);
    showToast("Cámara activada");
  } catch (err) {
    console.error(err);
    showToast("Sin cámara — usa botones 1–5");
    document.getElementById("camera-placeholder").textContent =
      "Cámara no disponible. Usa los botones o las teclas 1–5.";
  }
}

function skipCamera() {
  hideWelcome();
  setStatus("Modo manual — botones o teclas 1–5");
  showToast("Puedes usar botones o teclado");
}

async function boot() {
  const cfg = await loadConfig();
  theme = cfg.theme;
  assignment = cfg.assignment;
  applyTheme(theme);

  // Warm sample to validate expression early
  sampleCurve(assignment, 10);

  gestureEngine = createGestureEngine({
    onFingers: (n) => applyMode(n, "gesture"),
    onStatus: setStatus,
  });

  bindShell({
    theme,
    assignment,
    onMode: (m) => applyMode(m, "manual"),
    onStartCamera: startCamera,
    onSkipCamera: skipCamera,
    onReset: resetApp,
    onToggleExplain: () => {
      explainOn = !explainOn;
      setExplainMode(explainOn, currentMode || 1);
      document.getElementById("btn-explain").classList.toggle("btn-primary", explainOn);
      document.getElementById("btn-explain").classList.toggle("btn-secondary", !explainOn);
    },
  });

  clearResults();
  renderPlot2D(assignment, null, "plot2d");
  document.getElementById("plot3d").classList.add("hidden");

  const checks = runMathChecks();
  const failed = checks.filter((c) => !c.ok);
  console.table(checks);
  if (failed.length) {
    console.warn("Algunas autopruebas matemáticas fallaron", failed);
  } else {
    console.info("Autopruebas matemáticas OK");
  }

  setStatus("Listo — activa la cámara o usa 1–5");
}

boot().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<p style="padding:2rem;font-family:sans-serif">Error al cargar: ${err.message}. Abre el proyecto con un servidor local (no file://).</p>`;
});
