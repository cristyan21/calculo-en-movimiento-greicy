/**
 * MediaPipe Hands gesture engine with strong debounce and lock.
 * Confirms a finger count only after it stays stable; then locks until
 * the user holds a *different* count long enough (or shows a fist).
 */
export function createGestureEngine({ onFingers, onStatus, onLandmarks }) {
  let hands = null;
  let camera = null;
  let running = false;

  /** Last confirmed mode (1–5), null if unlocked */
  let lockedFingers = null;
  /** Candidate currently being held */
  let pending = null;
  let pendingCount = 0;
  /** Rolling votes for majority smoothing */
  const voteWindow = [];
  const VOTE_SIZE = 9;
  /** Frames of the same count needed to confirm / switch */
  const CONFIRM_FRAMES = 14;
  /** Extra frames required when switching away from a lock */
  const SWITCH_FRAMES = 18;
  /** Ignore tiny thumb noise: thumb must be clearly open */
  const THUMB_OPEN_RATIO = 1.18;

  let lastConfirmAt = 0;
  const COOLDOWN_MS = 700;

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
   * Count extended fingers 0–5.
   * Uses handedness for a more reliable thumb test.
   */
  function countFingers(landmarks, handednessLabel) {
    let count = 0;

    // Non-thumb fingers: tip above PIP (lower y in image coords)
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    for (let i = 0; i < tips.length; i++) {
      const tip = landmarks[tips[i]];
      const pip = landmarks[pips[i]];
      const mcp = landmarks[pips[i] - 2];
      // Prefer tip clearly above both PIP and MCP
      if (tip.y < pip.y - 0.02 && tip.y < mcp.y - 0.01) count += 1;
    }

    // Thumb: side-extension vs palm (stricter to avoid flicker)
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const wrist = landmarks[0];
    const indexMcp = landmarks[5];

    const tipDist = Math.hypot(thumbTip.x - wrist.x, thumbTip.y - wrist.y);
    const ipDist = Math.hypot(thumbIp.x - wrist.x, thumbIp.y - wrist.y);
    const awayFromIndex = Math.hypot(thumbTip.x - indexMcp.x, thumbTip.y - indexMcp.y);

    // In selfieMode, MediaPipe "Left"/"Right" is from the person's perspective
    const label = handednessLabel || "Right";
    let thumbSideOk = false;
    if (label === "Right") {
      // Right hand: extended thumb tip is to the left of IP in image (mirrored selfie)
      thumbSideOk = thumbTip.x < thumbIp.x - 0.03;
    } else {
      thumbSideOk = thumbTip.x > thumbIp.x + 0.03;
    }

    const thumbOpen =
      tipDist > ipDist * THUMB_OPEN_RATIO && awayFromIndex > 0.08 && thumbSideOk;
    if (thumbOpen) count += 1;

    return Math.min(5, count);
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
          ? `Modo fijado: ${lockedFingers} · acerca la mano para cambiar`
          : "Sin mano — mantén solo la mano a ~40–60 cm, sin tapar la cara"
      );
      onLandmarks?.(null);
      return;
    }

    const lm = results.multiHandLandmarks[0];
    const handLabel = results.multiHandedness?.[0]?.label || "Right";

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

    const raw = countFingers(lm, handLabel);
    const fingers = majorityVote(raw);
    onLandmarks?.(lm);

    const now = performance.now();
    const inCooldown = now - lastConfirmAt < COOLDOWN_MS;

    // Fist (0) unlocks so the next count can confirm cleanly
    if (fingers === 0) {
      if (lockedFingers != null) {
        lockedFingers = null;
        onStatus?.("Puño detectado — modo liberado. Ahora muestra 1–5 y sostén");
      } else {
        onStatus?.("Puño · abre 1–5 dedos y sostén 1 segundo");
      }
      pending = 0;
      pendingCount = 0;
      return;
    }

    if (fingers === pending) {
      pendingCount += 1;
    } else {
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
      onStatus?.(`Confirmado: ${fingers} dedo${fingers === 1 ? "" : "s"} (modo fijado)`);
      return;
    }

    if (lockedFingers != null && fingers === lockedFingers) {
      onStatus?.(`Modo fijado: ${lockedFingers} · para cambiar, sostén otro gesto ~1 s (o puño)`);
    } else if (lockedFingers != null) {
      const left = Math.max(0, need - pendingCount);
      onStatus?.(
        `Viendo ${fingers}… mantén estable (${left} frames) para cambiar de ${lockedFingers}`
      );
    } else {
      const left = Math.max(0, need - pendingCount);
      onStatus?.(
        left > 0
          ? `Viendo ${fingers} dedo${fingers === 1 ? "" : "s"}… sostén (~${left})`
          : `Viendo ${fingers} dedo${fingers === 1 ? "" : "s"}`
      );
    }
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
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
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
      onStatus?.("Cámara activa — muestra 1–5 y sostén 1 segundo");
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
  }

  return { start, stop, resetStability, isRunning: () => running };
}
