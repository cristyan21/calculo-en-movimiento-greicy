# Kit para otros grupos (10–15 minutos)

Este proyecto está pensado para que otros equipos presenten **la misma arquitectura** con **identidad y problema distintos**.

## Qué debe ser único en cada grupo

1. Nombre del producto y colores (`config/theme.*.json`)
2. Nombres del equipo
3. Función / intervalo / eje (`config/assignment.json`) — lo que les asigne la profesora
4. Repositorio y URL de GitHub Pages **propios**

## Pasos

### 1. Copiar el proyecto

- Opción A: **Fork** del repo en GitHub y renombrar.
- Opción B: Clonar y subir a un **repo nuevo** bajo su cuenta.

### 2. Crear su tema

1. Copia `config/theme.plantilla.json` como `config/theme.su-grupo.json`.
2. Cambia: `productName`, `tagline`, `team`, `colors`, `layout` (`split` | `focus-graph` | `focus-camera`).
3. En `config/app.json` pon `"activeTheme": "su-grupo"`.

### 3. Cargar su problema

Edita `config/assignment.json`:

```json
{
  "functionExpression": "sin(x)",
  "interval": { "a": 0, "b": 3.1416 },
  "axis": "x",
  "displayLatex": "f(x) = \\sin(x)",
  "nIntervals": 800,
  "units": { "area": "u²", "volume": "u³", "surface": "u²", "arc": "u" },
  "notes": "Asignación del grupo …"
}
```

Expresiones permitidas: `+ - * / ^`, paréntesis, `sin cos tan exp log ln sqrt abs`, `pi`, `e`.

### 4. Publicar

1. Activen **GitHub Pages** (branch `main`, carpeta `/` o `/docs` según cómo lo suban; este repo usa la raíz).
2. Prueben el enlace en HTTPS y la cámara.
3. Entreguen también un ZIP de respaldo si la docente lo pide.

### 5. Documentación propia

Copien `docs/GUION-EXPOSICION.md` y cambien nombres/roles.  
No entreguen el mismo guion palabra por palabra: adapten ejemplos a **su** función.

## Buenas prácticas académicas

- Cada grupo debe entender y poder explicar el código y las integrales.
- Distintos temas + distintos problemas + distintos repos = entregas diferenciadas.
- No compartan un único enlace Pages para toda la clase.

## Verificación rápida

```bash
node scripts/check-math.mjs
```

Luego probar en el navegador los cinco botones con su `assignment.json`.
