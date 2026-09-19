import { sampleCurve } from "../math/index.js";
import { showParticleSolid, hideParticleSolid } from "./solid-particles.js";

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function renderPlot2D(assignment, modeResult, targetId = "plot2d") {
  const { xs, ys, a, b } = sampleCurve(assignment, 360);
  const line = cssVar("--plot-line", "#d4789a");
  const fill = cssVar("--plot-fill", "rgba(212,120,154,0.35)");
  const arc = cssVar("--plot-arc", "#9b7bb8");

  const traces = [
    {
      x: xs,
      y: ys,
      type: "scatter",
      mode: "lines",
      name: "f(x)",
      line: { color: line, width: 3 },
    },
  ];

  if (modeResult?.mode === "area") {
    traces.push({
      x: [...xs, b, a],
      y: [...ys, 0, 0],
      type: "scatter",
      fill: "toself",
      fillcolor: fill,
      line: { width: 0 },
      name: "Región",
      hoverinfo: "skip",
    });
  }

  if (modeResult?.mode === "arc") {
    traces[0].line = { color: arc, width: 5 };
  }

  const layout = {
    margin: { l: 50, r: 20, t: 30, b: 45 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(255,255,255,0.65)",
    title: { text: modeResult?.title || "Gráfica 2D", font: { size: 14 } },
    xaxis: { title: "x", zeroline: true },
    yaxis: { title: "y", zeroline: true },
    showlegend: false,
    annotations: [
      {
        x: a,
        y: 0,
        text: "a",
        showarrow: false,
        yshift: -14,
        font: { size: 12 },
      },
      {
        x: b,
        y: 0,
        text: "b",
        showarrow: false,
        yshift: -14,
        font: { size: 12 },
      },
    ],
  };

  window.Plotly.react(targetId, traces, layout, {
    displayModeBar: false,
    responsive: true,
  });
}

export function showPlotForMode(mode, assignment, modeResult) {
  const plot2d = document.getElementById("plot2d");
  const plot3d = document.getElementById("plot3d");
  const m = Number(mode);
  const needs3d = m === 2 || m === 3 || m === 4;

  if (needs3d) {
    plot2d.classList.add("hidden");
    plot3d.classList.remove("hidden");
    hideParticleSolid(); // ensure clean call before show in showPlotForMode
    showParticleSolid(assignment, modeResult);
  } else {
    hideParticleSolid();
    plot3d.classList.add("hidden");
    plot2d.classList.remove("hidden");
    renderPlot2D(assignment, modeResult, "plot2d");
  }
}
