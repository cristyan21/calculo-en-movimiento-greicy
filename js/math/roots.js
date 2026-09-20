/**
 * ARCHIVO: js/math/roots.js
 * QUÉ ES: Busca dónde f(x) = 0 dentro de [a, b].
 * PARA EXPLICAR: Si la curva cruza el eje x, el área geométrica no es solo la
 * integral con signo: hay que partir el intervalo en las raíces y sumar |∫|.
 * Usa cambios de signo + bisección. Sirve al gesto de 1 dedo (área).
 */
export function findRoots(f, a, b, samples = 400, tol = 1e-8) {
  const roots = [];
  const pushUnique = (r) => {
    if (!Number.isFinite(r)) return;
    if (roots.some((x) => Math.abs(x - r) < 1e-5)) return;
    roots.push(r);
  };

  const fa0 = f(a);
  const fb0 = f(b);
  if (Math.abs(fa0) < tol) pushUnique(a);
  if (Math.abs(fb0) < tol) pushUnique(b);

  let xPrev = a;
  let yPrev = fa0;
  for (let i = 1; i <= samples; i++) {
    const x = a + ((b - a) * i) / samples;
    const y = f(x);
    if (!Number.isFinite(y) || !Number.isFinite(yPrev)) {
      xPrev = x;
      yPrev = y;
      continue;
    }
    if (Math.abs(y) < tol) {
      pushUnique(x);
    } else if (yPrev === 0) {
      // already handled
    } else if (yPrev * y < 0) {
      pushUnique(bisect(f, xPrev, x, tol));
    }
    xPrev = x;
    yPrev = y;
  }

  return roots.sort((p, q) => p - q);
}

function bisect(f, left, right, tol) {
  let a = left;
  let b = right;
  let fa = f(a);
  for (let i = 0; i < 80; i++) {
    const m = 0.5 * (a + b);
    const fm = f(m);
    if (!Number.isFinite(fm)) return m;
    if (Math.abs(fm) < tol || Math.abs(b - a) < tol) return m;
    if (fa * fm <= 0) {
      b = m;
    } else {
      a = m;
      fa = fm;
    }
  }
  return 0.5 * (a + b);
}
