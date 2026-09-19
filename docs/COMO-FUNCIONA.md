# Cómo funciona (guía para explicar)

Esta guía tiene dos capas: **cálculo** (para la profesora) y **software** (si pregunta cómo está hecho).

---

## Capa A — Enfoque de cálculo

La docente asigna \(f(x)\), el intervalo \([a,b]\) y el eje. El programa **no inventa** el problema: lo lee de la configuración.

### 1 dedo — Área

- Integral definida (con signo): \(\displaystyle \int_a^b f(x)\,dx\)
- Área geométrica: si \(f\) cruza el eje \(x\), se parten los subintervalos en las raíces y se suma \(\sum \left|\int\right|\).

### 2 dedos — Volumen (eje \(x\))

Método de discos:

\[
V = \pi \int_a^b [f(x)]^2\,dx
\]

### 3 dedos — Volumen (eje \(y\))

Método de capas cilíndricas (interpretación estándar con radio \(x\) y altura \(f(x)\)):

\[
V = 2\pi \int_a^b x\, f(x)\,dx
\]

### 4 dedos — Superficie de revolución

Sobre el eje asignado, por ejemplo en \(x\):

\[
S = 2\pi \int_a^b |f(x)|\sqrt{1+[f'(x)]^2}\,dx
\]

### 5 dedos — Longitud de arco

\[
L = \int_a^b \sqrt{1+[f'(x)]^2}\,dx
\]

### Precisión numérica

Las integrales se calculan con **regla de Simpson compuesta** (muchos subintervalos). La derivada \(f'(x)\) se estima con diferencia centrada. El panel puede mostrar un **error estimado** comparando \(n\) y \(2n\).

---

## Capa B — Cómo funciona el software (lenguaje simple)

```text
Usuario (mano o botón)
        ↓
Conteo de dedos (1–5)     ← cámara + MediaPipe, o teclado
        ↓
Motor de cálculo          ← fórmulas de arriba + Simpson
        ↓
Gráfico 2D o sólido 3D    ← Plotly
        ↓
Panel: fórmula + valor + unidades
```

1. **Configuración:** `assignment.json` trae la función y el intervalo; el tema da colores y nombre.
2. **Gestos:** la cámara detecta la mano; si el mismo número de dedos se mantiene unos fotogramas, se confirma el gesto (evita parpadeos).
3. **Cálculo:** un módulo de matemáticas evalúa la integral correspondiente.
4. **Visualización:** Plotly dibuja la curva o el sólido.
5. **Respaldo:** si no hay cámara, los botones 1–5 hacen exactamente lo mismo.

No hace falta ser programadora para explicar la Capa A. La Capa B solo se usa si la profesora pregunta por la herramienta.
