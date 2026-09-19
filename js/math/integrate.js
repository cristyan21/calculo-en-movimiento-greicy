/**
 * Composite Simpson's rule with even n.
 * Returns { value, estimateError } using n and 2n comparison when possible.
 */
export function simpson(f, a, b, n = 800) {
  if (!(b > a)) throw new Error("El intervalo [a, b] debe cumplir b > a.");
  let N = Math.max(2, Math.floor(n));
  if (N % 2 === 1) N += 1;

  const integrate = (parts) => {
    const h = (b - a) / parts;
    let sum = f(a) + f(b);
    for (let i = 1; i < parts; i++) {
      const x = a + i * h;
      const y = f(x);
      if (!Number.isFinite(y)) {
        throw new Error(`f(x) no es finita en x = ${x}`);
      }
      sum += i % 2 === 0 ? 2 * y : 4 * y;
    }
    return (h / 3) * sum;
  };

  const value = integrate(N);
  let estimateError = null;
  try {
    const finer = integrate(N * 2);
    estimateError = Math.abs(finer - value);
  } catch {
    estimateError = null;
  }

  return { value, n: N, estimateError };
}
