import { compileFunction } from "./parser.js";
import { computeArea } from "./area.js";
import { computeVolume } from "./volume.js";
import { computeSurface } from "./surface.js";
import { computeArcLength } from "./arc-length.js";

export const MODES = {
  1: { id: "area", label: "Área", short: "Área bajo la curva" },
  2: { id: "volume_x", label: "Vol. X", short: "Volumen eje x" },
  3: { id: "volume_y", label: "Vol. Y", short: "Volumen eje y" },
  4: { id: "surface", label: "Superficie", short: "Área superficial" },
  5: { id: "arc", label: "Arco", short: "Longitud de arco" },
};

/**
 * Run the calculation for finger/mode 1..5
 */
export function runMode(mode, assignment) {
  const f = compileFunction(assignment.functionExpression);
  const a = Number(assignment.interval.a);
  const b = Number(assignment.interval.b);
  const n = Number(assignment.nIntervals) || 800;
  const axis = assignment.axis === "y" ? "y" : "x";

  switch (Number(mode)) {
    case 1:
      return computeArea(f, a, b, n);
    case 2:
      return computeVolume(f, a, b, "x", n);
    case 3:
      return computeVolume(f, a, b, "y", n);
    case 4:
      return computeSurface(f, a, b, axis, n);
    case 5:
      return computeArcLength(f, a, b, n);
    default:
      throw new Error("Modo inválido. Usa 1 a 5.");
  }
}

export function sampleCurve(assignment, samples = 300) {
  const f = compileFunction(assignment.functionExpression);
  const a = Number(assignment.interval.a);
  const b = Number(assignment.interval.b);
  const xs = [];
  const ys = [];
  for (let i = 0; i <= samples; i++) {
    const x = a + ((b - a) * i) / samples;
    xs.push(x);
    ys.push(f(x));
  }
  return { xs, ys, f, a, b };
}
