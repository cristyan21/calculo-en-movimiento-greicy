/**
 * ARCHIVO: js/math/parser.js
 * QUÉ ES: Interpreta la fórmula escrita de f(x) (ej. "x^2", "sin(x)").
 * PARA EXPLICAR: Convierte el texto que asigna la docente en una función
 * numérica que el resto del programa puede evaluar. También estima f'(x)
 * con diferencia centrada (necesaria para superficie y longitud de arco).
 * Soporta +, -, *, /, ^ y funciones como sin, cos, exp, log, sqrt, etc.
 */
export function compileFunction(expression) {
  const raw = String(expression || "").trim();
  if (!raw) throw new Error("La expresión de la función está vacía.");

  let expr = raw
    .replace(/π/g, "pi")
    .replace(/\bln\s*\(/g, "log(")
    .replace(/\^/g, "**");

  // Implicit multiplication: 2x, 2(x), )(
  expr = expr.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2");
  expr = expr.replace(/(\))\s*(\d)/g, "$1*$2");
  expr = expr.replace(/(\))\s*([a-zA-Z(])/g, "$1*$2");
  expr = expr.replace(/(\d)\s*(pi|e)\b/g, "$1*$2");

  const allowed = /^[0-9+\-*/().,\sA-Za-z_]+$/;
  const sanitized = expr.replace(/\*\*/g, "");
  if (!allowed.test(sanitized)) {
    throw new Error("La expresión contiene símbolos no permitidos.");
  }

  const banned = /(window|document|Function|eval|globalThis|constructor|prototype|import|export)/i;
  if (banned.test(expr)) {
    throw new Error("La expresión no es segura.");
  }

  // eslint-disable-next-line no-new-func
  const fn = new Function(
    "x",
    `
    const sin = Math.sin, cos = Math.cos, tan = Math.tan;
    const asin = Math.asin, acos = Math.acos, atan = Math.atan;
    const exp = Math.exp, log = Math.log, sqrt = Math.sqrt, abs = Math.abs;
    const pi = Math.PI, e = Math.E, pow = Math.pow;
    return (${expr});
    `
  );

  const sample = fn(0.5);
  if (!Number.isFinite(sample) && sample !== Infinity && sample !== -Infinity) {
    // Allow non-finite at 0.5 only if expression is otherwise valid; still wrap
  }

  const wrapped = (x) => {
    const y = fn(x);
    if (!Number.isFinite(y)) return NaN;
    return y;
  };

  wrapped.expression = raw;
  return wrapped;
}

export function derivative(f, x, h = 1e-5) {
  const y1 = f(x + h);
  const y0 = f(x - h);
  if (!Number.isFinite(y1) || !Number.isFinite(y0)) return NaN;
  return (y1 - y0) / (2 * h);
}
