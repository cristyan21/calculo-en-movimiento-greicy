# Guion de exposición (5–8 minutos)

Equipo sugerido: 3 integrantes. Todas deben poder explicar el gesto que demuestren.

## Roles del día

| Integrante | Momento | Qué dice / hace |
|-----------|---------|-----------------|
| A (Matemática) — Greicy Martinez | Problema + gestos 1 y 5 | Función, intervalo, área y arco |
| B (Interfaz) — Mariana Quiroga | Inicio + demo de uso | Bienvenida, cámara/botones, modo explicar |
| C (Integración) — Miluska Mancera | Gestos 2–4 | Volúmenes y superficie + enlace Pages |

## Guion

### 0:00–0:45 — Apertura (B)

> “Nuestro proyecto es **Cálculo en Movimiento**. La docente asigna la función, el intervalo y el eje; nosotras construimos una app donde cada número de dedos activa un cálculo integral con su visualización.”

Mostrar el enlace de GitHub Pages (o localhost).

### 0:45–1:30 — Problema asignado (A)

Leer en voz alta \(f(x)\), \([a,b]\) y el eje.  
Decir: “No elegimos nosotras la función; está cargada como la asignaron.”

### 1:30–3:30 — Demo de gestos

1. **1 dedo — Área (A):** sombreado + integral con signo vs área geométrica si aplica.  
2. **2 dedos — Volumen eje x (C):** sólido 3D + fórmula de discos.  
3. **3 dedos — Volumen eje y (C):** capas cilíndricas.  
4. **4 dedos — Superficie (C):** fórmula de superficie en el eje asignado.  
5. **5 dedos — Arco (A):** curva resaltada + longitud.

Si la cámara falla: “Usamos el control alternativo con botones, como pide la entrega final.”

### 3:30–4:30 — Precisión (A)

> “Las integrales se calculan con Simpson. Verificamos con funciones conocidas (por ejemplo \(x^2\) en \([0,2]\) da \(8/3\)).”

### 4:30–5:30 — Cómo está hecho, sin jerga (B o C)

> “La cámara cuenta dedos, el motor aplica la integral del gesto y Plotly muestra la gráfica. Si preguntan el código, podemos abrir el módulo de matemáticas, pero el foco es el cálculo.”

### 5:30–6:30 — Cierre

Reiniciar la app. Recordar manual de usuario y que el software lo puede usar otra persona.

## Preguntas frecuentes

**¿Qué pasa si la función cruza el eje x?**  
Mostramos integral con signo y área geométrica por tramos.

**¿Por qué el resultado es aproximado?**  
Es numérico (Simpson) con muchos intervalos; el error estimado aparece en pantalla.

**¿Quién programó qué?**  
Cada una explica su rol (matemática / interfaz / integración) y el flujo general.

**¿Pueden cambiar la función?**  
Sí, editando `config/assignment.json` con lo que asigne la docente.
