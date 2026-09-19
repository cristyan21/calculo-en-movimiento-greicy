/**
 * MediaPipe Hands — conteo por distancia (no depende de que los dedos apunten “arriba”).
 * Confirma el gesto tras sostenerlo; muestra siempre el conteo en vivo.
 */
export function createGestureEngine({ onFingers, onStatus, onLandmarks }) {
  let hands = null;
  let camera = null;
  let running = false;

  let lockedFingers = null;
  let pending = null;
  let pendingCount = 0;
  const voteWindow = [];
  const VOTE_SIZE = 7;
  const CONFIRM_FRAMES = 10;
  const SWITCH_FRAMES = 12;

  let lastConfirmAt = 0;
  const COOLDOWN_MS = 450;

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

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

  /**
   * Dedo extendido si la punta está claramente más lejos del MCP que el PIP.
   * Funciona con la mano inclinada (como en las fotos del equipo).
   */
  function isFingerOpen(lm, tipIdx, pipIdx, mcpIdx, ratio = 1.12) {
    const tip = lm[tipIdx];
    const pip = lm[pipIdx];
    const mcp = lm[mcpIdx];
    const dTip = dist(mcp, tip);
    const dPip = dist(mcp, pip);
    if (dPip < 1e-6) return false;
    return dTip > dPip * ratio;
  }

  /**
   * Pulgar: punta más lejos de la base (CMC/MCP) que la articulación IP,
   * y separada del índice (para no contarlo plegado sobre la palma).
   */
  function isThumbOpen(lm) {
    const tip = lm[4];
    const ip = lm[3];
    const mcp = lm[2];
    const cmc = lm[1];
    const indexMcp = lm[5];
    const wrist = lm[0];

    const dTip = dist(cmc, tip);
    const dIp = dist(cmc, ip);
    const awayIndex = dist(tip, indexMcp);
    const awayWrist = dist(tip, wrist);
    const foldedNearPalm = awayIndex < 0.07 && dist(tip, mcp) < 0.09;

    if (foldedNearPalm) return false;
    return dTip > dIp * 1.12 && awayIndex > 0.09 && awayWrist > dist(ip, wrist) * 1.05;
  }

  function countFingers(landmarks) {
    let count = 0;
    // índice, medio, anular, meñique
    const chains = [
      [8, 6, 5],
      [12, 10, 9],
      [16, 14, 13],
      [20, 18, 17],
    ];
    for (const [tip, pip, mcp] of chains) {
      if (isFingerOpen(landmarks, tip, pip, mcp, 1.1)) count += 1;
    }
    if (isThumbOpen(landmarks)) count += 1;
    return Math.min(5, count);
  }

  function statusLine(live, locked) {
    const liveTxt = `Detectando ahora: ${live}`;
    if (locked == null) {
      return `${liveTxt} · sostén ~1 s para confirmar`;
    }
    if (live === locked) {
      return `${liveTxt} · modo fijado ${locked} · cambia de gesto o haz puño`;
    }
    return `${liveTxt} · cambiando de ${locked}… mantén estable`;
  }

  function handleResults(results) {
    const canvas = document.getElementById("hand-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks?.length) {
      pending = null;
      pendingCount = 0;
      voteWindow.length = 0;
      onStatus?.(
        lockedFingers
          ? `Sin mano · modo fijado ${lockedFingers} · vuelve a mostrar la mano`
          : "Sin mano — solo la mano, palma a la cámara, 40–60 cm"
      );
      updateLiveChip(null);
      onLandmarks?.(null);
      return;
    }

    const lm = results.multiHandLandmarks[0];

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
    const inCooldown = now - lastConfirmAt < COOLDOWN_MS;

    // Puño libera el modo
    if (fingers === 0) {
      if (lockedFingers != null) {
        lockedFingers = null;
        onStatus?.("Puño — modo liberado. Muestra 1–5 y sostén");
      } else {
        onStatus?.("Puño · abre 1–5 dedos y sostén");
      }
      pending = 0;
      pendingCount = 0;
      return;
    }

    if (fingers === pending) pendingCount += 1;
    else {
      pending = fingers;
      pendingCount = 1;
    }

    const need =
      lockedFingers != null && fingers !== lockedFingers ? SWITCH_FRAMES : CONFIRM_FRAMES;

    const canConfirm =
      !inCooldown &&
      pendingCount >= need &&
      fingers >= 1 &&
      fingers <= 5 &&
      fingers !== lockedFingers;

    if (canConfirm) {
      lockedFingers = fingers;
      lastConfirmAt = now;
      pendingCount = 0;
      onFingers?.(fingers);
      onStatus?.(`Confirmado: ${fingers} dedo${fingers === 1 ? "" : "s"}`);
      return;
    }

    onStatus?.(statusLine(fingers, lockedFingers));
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

  async function start(videoEl) {
    if (running) return;
    onStatus?.("Iniciando cámara…");

    hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
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
      onStatus?.("Cámara activa — mira “Dedos en vivo” y sostén el gesto");
    } catch (err) {
      running = false;
      onStatus?.("No se pudo acceder a la cámara. Usa los botones 1–5.");
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
    pending = null;
    pendingCount = 0;
    voteWindow.length = 0;
    lastConfirmAt = 0;
    updateLiveChip(null);
  }

  return { start, stop, resetStability, isRunning: () => running };
}
