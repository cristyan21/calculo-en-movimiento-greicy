# Cálculo en Movimiento (equipo Greicy)

Aplicación web de **Cálculo Integral en Movimiento**: cámara + gestos (1–5 dedos), gráficas 2D/3D y resultados precisos de área, volumen, superficie y longitud de arco.

## Cómo abrirlo en local

Necesitas un servidor local (los módulos ES y la cámara no funcionan bien con `file://`).

```bash
# Opción A — Node (si tienes npx)
npx --yes serve -l 5173

# Opción B — Python
python -m http.server 5173
```

Luego abre: http://localhost:5173

## Controles

| Entrada | Acción |
|--------|--------|
| 1 dedo / tecla `1` / botón | Área (integral + área geométrica) |
| 2 | Volumen alrededor del eje x (discos) |
| 3 | Volumen alrededor del eje y (capas) |
| 4 | Área superficial (eje asignado) |
| 5 | Longitud de arco |
| `R` / Reiniciar | Vuelve al estado inicial |

## Configuración

- [`config/assignment.json`](config/assignment.json) — función, `[a,b]`, eje (lo que asigne la docente)
- [`config/theme.greicy.json`](config/theme.greicy.json) — identidad visual del equipo
- [`config/app.json`](config/app.json) — tema activo (`greicy` o `plantilla`)

## Documentación para exponer

Ver carpeta [`docs/`](docs/).

## Autopruebas matemáticas

```bash
node scripts/check-math.mjs
```

## Publicación

GitHub Pages (remoto de desarrollo: GitHub de Crisd; luego migrar al repo colaborativo del grupo).
