import { MODES } from "../math/index.js";

export function bindShell({ theme, assignment, onMode, onStartCamera, onSkipCamera, onReset, onToggleExplain }) {
  document.getElementById("product-name").textContent = theme.productName;
  document.getElementById("product-tagline").textContent = theme.tagline;
  document.getElementById("welcome-title").textContent = theme.welcomeTitle || "Bienvenida";
  document.getElementById("welcome-body").textContent = theme.welcomeBody;
  document.title = `${theme.productName} — Cálculo Integral`;

  const team = document.getElementById("team-list");
  team.innerHTML = "";
  (theme.team || []).forEach((name) => {
    const span = document.createElement("span");
    span.className = "team-pill";
    span.textContent = name;
    team.appendChild(span);
  });

  document.getElementById("fn-display").textContent =
    assignment.displayLatex || `f(x) = ${assignment.functionExpression}`;
  document.getElementById("interval-display").textContent =
    `[${assignment.interval.a}, ${assignment.interval.b}]`;
  document.getElementById("axis-display").textContent =
    assignment.axis === "y" ? "eje y" : "eje x";
  document.getElementById("notes-display").textContent = assignment.notes || "";

  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => onMode(Number(btn.dataset.mode)));
  });

  document.getElementById("btn-start-camera")?.addEventListener("click", onStartCamera);
  document.getElementById("btn-skip-camera")?.addEventListener("click", onSkipCamera);
  document.getElementById("btn-camera")?.addEventListener("click", onStartCamera);
  document.getElementById("btn-reset")?.addEventListener("click", onReset);
  document.getElementById("btn-explain")?.addEventListener("click", onToggleExplain);

  window.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 5) onMode(n);
    if (e.key === "r" || e.key === "R") onReset();
  });
}

export function setActiveMode(mode) {
  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.mode) === Number(mode));
  });
  const info = MODES[mode];
  const chip = document.getElementById("gesture-chip");
  if (info) {
    chip.textContent = `${mode} dedo${mode === 1 ? "" : "s"} → ${info.short}`;
    chip.classList.remove("warn");
    chip.classList.add("ok");
  }
}

export function hideWelcome() {
  document.getElementById("welcome-overlay")?.classList.add("hidden");
}

export function showToast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("show"), 2200);
}
