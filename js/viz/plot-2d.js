import { sampleCurve } from "../math/index.js";

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

export function renderPlot3D(assignment, modeResult, targetId = "plot3d") {
  const { xs, ys, a, b, f } = sampleCurve(assignment, 50);
  const aroundY = modeResult?.mode === "volume_y";
  const isSurface = modeResult?.mode === "surface";

  // Build surface of revolution about x (default) or suggest about y for volume_y
  const thetaSteps = 36;
  const xSurf = [];
  const ySurf = [];
  const zSurf = [];

  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const r = Math.abs(ys[i]);
    const rowX = [];
    const rowY = [];
    const rowZ = [];
    for (let j = 0; j <= thetaSteps; j++) {
      const th = (j / thetaSteps) * Math.PI * 2;
      if (aroundY) {
        // revolve around y: treat y as axis, radius = x
        const radius = Math.abs(x);
        rowX.push(radius * Math.cos(th));
        rowY.push(f(x));
        rowZ.push(radius * Math.sin(th));
      } else {
        rowX.push(x);
        rowY.push(r * Math.cos(th));
        rowZ.push(r * Math.sin(th));
      }
    }
    xSurf.push(rowX);
    ySurf.push(rowY);
    zSurf.push(rowZ);
  }

  const color = cssVar("--blush-deep", "#d4789a");
  const opacity = isSurface ? 0.55 : 0.75;

  const data = [
    {
      type: "surface",
      x: xSurf,
      y: ySurf,
      z: zSurf,
      showscale: false,
      opacity,
      colorscale: [
        [0, "#fff4ea"],
        [0.5, color],
        [1, "#9b7bb8"],
      ],
    },
  ];

  const layout = {
    margin: { l: 0, r: 0, t: 30, b: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    title: {
      text: modeResult?.title || "Sólido 3D",
      font: { size: 14 },
    },
    scene: {
      xaxis: { title: "x" },
      yaxis: { title: aroundY ? "y" : "y" },
      zaxis: { title: "z" },
      aspectmode: "data",
    },
  };

  window.Plotly.react(targetId, data, layout, {
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
    renderPlot3D(assignment, modeResult, "plot3d");
  } else {
    plot3d.classList.add("hidden");
    plot2d.classList.remove("hidden");
    renderPlot2D(assignment, modeResult, "plot2d");
  }
}
