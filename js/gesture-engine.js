/**
 * ARCHIVO: js/gesture-engine.js
 * QUÉ ES: Reconocimiento de mano y conteo de dedos (MediaPipe).
 * PARA EXPLICAR: Activa la cámara, dibuja el esqueleto de la mano y cuenta dedos.
 * Flujo pedagógico acordado: mostrar gesto → sostener 1.5 s → modo fijado →
 * PUÑO para liberar → otro gesto. Mano derecha, palma a la cámara.
 * En 1–4 se ignora el pulgar; el 5 requiere los cuatro dedos largos + pulgar.
 * Si la cámara falla, la app sigue con botones 1–5 (mismo resultado matemático).
 */
export function createGestureEngine({ onFingers, onStatus, onLandmarks }) {
  let hands = null;
  let camera = null;
  let running = false;

  /** @type {null | number} modo confirmado 1–5 */
  let lockedFingers = null;
  /** true solo después de puño (o al inicio) — permite confirmar un gesto */
  let unlocked = true;

  let pending = null;
  let pendingSince = 0;
  const voteWindow = [];
  const VOTE_SIZE = 5;

  const CONFIRM_MS = 1500;
  const FIST_MS = 400;
  let fistSince = 0;

  function majorityVote(value) {
    voteWindow.push(value);
    if (voteWindow.length > VOTE_SIZE) voteWindow.shift();
    const counts = new Map();
    for (const v of voteWindow) counts.set(v, (counts.get(v) || 0) + 1);
    let best = value;
    let bestN = 0;
    for (const [k, n] of counts) {
      if (n > bestN) {
        best = k;
        bestN = n;
      }
    }
    return best;
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /**
   * Conteo estilo profesora + pulgar solo para el 5.
   * Retorna 0–5.
   */
  function countFingers(lm) {
    // 4 dedos largos (igual que el demo de la profesora)
    let longFingers = 0;
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    for (let i = 0; i < 4; i++) {
      if (lm[tips[i]].y < lm[pips[i]].y) longFingers += 1;
    }

    // Pulgar abierto (solo importa para llegar a 5)
    const tip = lm[4];
    const ip = lm[3];
    const indexMcp = lm[5];
    const thumbOpen =
      tip.x < ip.x - 0.03 && // mano derecha, selfieMode: pulgar hacia afuera
      dist(tip, indexMcp) > 0.08;

    if (longFingers === 0) return 0; // puño (pulgar ignorado)
    if (longFingers === 4 && thumbOpen) return 5;
    // 1–4: pulgar ignorado a propósito
    return longFingers;
  }

  function updateLiveChip(n) {
    const el = document.getElementById("live-fingers");
    if (!el) return;
    if (n == null) {
      el.textContent = "Dedos en vivo: —";
      el.classList.remove("ok");
      return;
    }
    el.textContent = `Dedos en vivo: ${n}`;
    el.classList.add("ok");
  }

  function handleResults(results) {
    const canvas = document.getElementById("hand-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks?.length) {
      pending = null;
      pendingSince = 0;
      fistSince = 0;
      voteWindow.length = 0;
      updateLiveChip(null);
      onStatus?.(
        lockedFingers
          ? `Sin mano · modo ${lockedFingers} fijado · haz puño frente a la cámara para cambiar`
          : "Sin mano — mano DERECHA, palma a la cámara, dedos arriba"
      );
      onLandmarks?.(null);
      return;
    }

    // Preferir mano derecha (como acordamos)
    let lm = null;
    let label = "Right";
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const handLabel = results.multiHandedness?.[i]?.label || "Right";
      if (handLabel === "Right") {
        lm = results.multiHandLandmarks[i];
        label = handLabel;
        break;
      }
    }
    // Si solo hay izquierda, usarla pero avisar
    if (!lm) {
      lm = results.multiHandLandmarks[0];
      label = results.multiHandedness?.[0]?.label || "Left";
    }

    if (typeof drawConnectors !== "undefined") {
      drawConnectors(ctx, lm, HAND_CONNECTIONS, {
        color: "rgba(212,120,154,0.95)",
        lineWidth: 2.5,
      });
      drawLandmarks(ctx, lm, {
        color: "rgba(255,255,255,0.95)",
        lineWidth: 1,
        radius: 3,
      });
    }

    const raw = countFingers(lm);
    const fingers = majorityVote(raw);
    updateLiveChip(fingers);
    onLandmarks?.(lm);

    const now = performance.now();

    if (label !== "Right") {
      onStatus?.("Usa la mano DERECHA (palma a la cámara)");
      return;
    }

    // —— PUÑO: única forma de liberar ——
    if (fingers === 0) {
      pending = null;
      pendingSince = 0;
      if (fistSince === 0) fistSince = now;
      const held = now - fistSince;
      if (held >= FIST_MS) {
        if (lockedFingers != null || !unlocked) {
          lockedFingers = null;
          unlocked = true;
          onStatus?.("Puño OK — modo liberado. Ahora muestra 1–5 y sostén 1.5 s");
        } else {
          onStatus?.("Puño · abre 1–5 dedos (palma a la cámara) y sostén 1.5 s");
        }
      } else {
        onStatus?.("Detectando puño…");
      }
      return;
    }

    fistSince = 0;

    // —— Modo fijado: ignorar otros gestos hasta puño ——
    if (lockedFingers != null && !unlocked) {
      onStatus?.(
        `Modo fijado: ${lockedFingers} · para cambiar haz PUÑO y luego el nuevo gesto`
      );
      return;
    }

    // —— Esperando confirmación de un gesto 1–5 ——
    if (fingers === pending) {
      // keep pendingSince
    } else {
      pending = fingers;
      pendingSince = now;
    }

    const heldMs = now - pendingSince;
    const leftSec = Math.max(0, (CONFIRM_MS - heldMs) / 1000);

    if (heldMs >= CONFIRM_MS && fingers >= 1 && fingers <= 5) {
      lockedFingers = fingers;
      unlocked = false;
      pending = null;
      pendingSince = 0;
      onFingers?.(fingers);
      onStatus?.(`Confirmado: ${fingers} dedo${fingers === 1 ? "" : "s"} · haz puño para cambiar`);
      return;
    }

    onStatus?.(
      `Viendo ${fingers} · sostén ${leftSec.toFixed(1)} s para confirmar` +
        (lockedFingers == null && unlocked ? "" : "")
    );
  }

  async function start(videoEl) {
    if (running) return;
    onStatus?.("Iniciando cámara…");

    hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65,
      selfieMode: true,
    });
    hands.onResults(handleResults);

    const canvas = document.getElementById("hand-canvas");
    const resize = () => {
      canvas.width = videoEl.clientWidth || 640;
      canvas.height = videoEl.clientHeight || 480;
    };
    resize();
    window.addEventListener("resize", resize);

    camera = new Camera(videoEl, {
      onFrame: async () => {
        if (hands) await hands.send({ image: videoEl });
      },
      width: 640,
      height: 480,
    });

    try {
      await camera.start();
      running = true;
      document.getElementById("camera-placeholder")?.classList.add("hidden");
      onStatus?.("Cámara OK — mano derecha, palma a la cámara · gesto → puño → gesto");
    } catch (err) {
      running = false;
      onStatus?.("Sin cámara — usa los botones 1–5");
      throw err;
    }
  }

  function stop() {
    running = false;
    const video = document.getElementById("webcam");
    const stream = video?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  }

  function resetStability() {
    lockedFingers = null;
    unlocked = true;
    pending = null;
    pendingSince = 0;
    fistSince = 0;
    voteWindow.length = 0;
    updateLiveChip(null);
  }

  return { start, stop, resetStability, isRunning: () => running };
}
