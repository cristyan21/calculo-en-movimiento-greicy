/**
 * MediaPipe Hands gesture engine with debounce and thumb-aware finger count.
 */
export function createGestureEngine({ onFingers, onStatus, onLandmarks }) {
  let hands = null;
  let camera = null;
  let running = false;
  let stableFingers = null;
  let pending = null;
  let pendingCount = 0;
  const STABLE_FRAMES = 4;

  function countFingers(landmarks) {
    // landmarks: 21 points. Tips: thumb 4, index 8, middle 12, ring 16, pinky 20
    let count = 0;

    // Thumb: compare tip x vs IP joint x depending on hand orientation (selfie mirrored later)
    // Use distance thumb tip to wrist vs thumb IP — if tip farther from palm center sideways
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMcp = landmarks[2];
    const wrist = landmarks[0];
    const thumbExtended =
      Math.hypot(thumbTip.x - wrist.x, thumbTip.y - wrist.y) >
      Math.hypot(thumbIp.x - wrist.x, thumbIp.y - wrist.y) * 1.05 &&
      Math.abs(thumbTip.x - thumbMcp.x) > 0.04;
    if (thumbExtended) count += 1;

    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    for (let i = 0; i < tips.length; i++) {
      if (landmarks[tips[i]].y < landmarks[pips[i]].y - 0.015) count += 1;
    }
    return Math.min(5, count);
  }

  function handleResults(results) {
    const canvas = document.getElementById("hand-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks?.length) {
      onStatus?.("Sin mano detectada — muestra la mano frente a la cámara");
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

    const fingers = countFingers(lm);
    onLandmarks?.(lm);

    if (fingers === pending) {
      pendingCount += 1;
    } else {
      pending = fingers;
      pendingCount = 1;
    }

    if (pendingCount >= STABLE_FRAMES && fingers !== stableFingers && fingers >= 1 && fingers <= 5) {
      stableFingers = fingers;
      onFingers?.(fingers);
    }

    onStatus?.(
      fingers >= 1
        ? `Mano detectada · ${fingers} dedo${fingers === 1 ? "" : "s"}`
        : "Mano detectada · cierra/abre dedos (1–5)"
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
      onStatus?.("Cámara activa — muestra 1 a 5 dedos");
    } catch (err) {
      running = false;
      onStatus?.("No se pudo acceder a la cámara. Usa los botones 1–5.");
      throw err;
    }
  }

  function stop() {
    running = false;
    // Camera util has no official stop in older builds; mute tracks if present
    const video = document.getElementById("webcam");
    const stream = video?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  }

  function resetStability() {
    stableFingers = null;
    pending = null;
    pendingCount = 0;
  }

  return { start, stop, resetStability, isRunning: () => running };
}
