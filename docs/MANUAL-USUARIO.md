# Manual de usuario

## Qué es esta aplicación

**Cálculo en Movimiento** permite explorar cinco conceptos de cálculo integral sobre una función asignada por la docente, usando gestos con la mano o botones en pantalla.

## Requisitos

- Navegador actualizado (Chrome o Edge recomendados).
- Cámara web (opcional; si no hay cámara, usa botones o teclas 1–5).
- Conexión a internet la primera vez (carga MediaPipe y Plotly desde CDN).
- Abrir la app por **HTTPS** (GitHub Pages) o **localhost** (no como archivo suelto).

## Instalación rápida

1. Descarga o clona el repositorio.
2. En la carpeta del proyecto ejecuta un servidor local, por ejemplo:
   - `npx --yes serve -l 5173`
   - o `python -m http.server 5173`
3. Abre `http://localhost:5173` en el navegador.
4. En GitHub Pages: entra al enlace publicado del equipo.

## Uso paso a paso

1. Lee el **problema asignado** (función, intervalo y eje).
2. Pulsa **Activar cámara** y acepta el permiso, **o** **Continuar sin cámara**.
3. Muestra **1 a 5 dedos** frente a la cámara, o pulsa los botones / teclas.
4. Observa la gráfica y el panel de **Resultado** (fórmula, valor y unidades).
5. Activa **Modo explicar** si quieres el texto breve del concepto.
6. Pulsa **Reiniciar** (o tecla `R`) para volver al inicio.

## Si algo falla

| Problema | Qué hacer |
|---------|-----------|
| No pide cámara / error de permiso | Revisa permisos del navegador; usa botones 1–5 |
| No detecta la mano | Mejora la luz; mantén la mano estable 1 segundo |
| Confunde el número de dedos | Usa los botones; separa bien los dedos |
| Página en blanco al abrir el HTML | No uses `file://`; sirve por localhost o Pages |
| Resultados raros | Verifica `config/assignment.json` (función e intervalo) |

## Qué entrega el software

Para cada gesto muestra:

- concepto de cálculo,
- fórmula de la integral,
- valor numérico con unidades,
- método (Simpson) y nota breve,
- en el caso del área: integral con signo y área geométrica si hay cruces con el eje x.
