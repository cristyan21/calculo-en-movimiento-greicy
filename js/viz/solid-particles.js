import { sampleCurve } from "../math/index.js";

/**
 * Three.js particle solid of revolution — inspired by the professor demo,
 * driven by the assigned f(x) and [a,b], Greicy palette.
 */
const N = 14000;

let ready = false;
let scene, camera, renderer, points, geo, mat;
let pos, tgt, col, tcol;
let animId = 0;
let containerEl = null;
let titleEl = null;
let visible = false;
let rotY = 0;

function mkCircleTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const cx = c.getContext("2d");
  const g = cx.createRadialGradient(64, 64, 0, 64, 64, 60);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  cx.fillStyle = g;
  cx.beginPath();
  cx.arc(64, 64, 60, 0, Math.PI * 2);
  cx.fill();
  return new THREE.CanvasTexture(c);
}

function setCol(i, c) {
  tcol[i * 3] = c.r;
  tcol[i * 3 + 1] = c.g;
  tcol[i * 3 + 2] = c.b;
}

function ensureInit(containerId = "plot3d") {
  if (ready) return;
  if (typeof THREE === "undefined") {
    throw new Error("Three.js no está cargado");
  }

  containerEl = document.getElementById(containerId);
  if (!containerEl) throw new Error("No existe el contenedor 3D");

  containerEl.innerHTML = "";
  containerEl.classList.add("plot3d-particles");

  titleEl = document.createElement("div");
  titleEl.className = "plot3d-title";
  titleEl.textContent = "Sólido 3D";
  containerEl.appendChild(titleEl);

  const w = Math.max(containerEl.clientWidth, 320);
  const h = Math.max(containerEl.clientHeight, 320);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
  camera.position.set(0, 1.2, 9);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  containerEl.appendChild(renderer.domElement);

  const tex = mkCircleTex();
  geo = new THREE.BufferGeometry();
  pos = new Float32Array(N * 3);
  tgt = new Float32Array(N * 3);
  col = new Float32Array(N * 3);
  tcol = new Float32Array(N * 3);

  for (let i = 0; i < N * 3; i++) {
    pos[i] = (Math.random() - 0.5) * 8;
    col[i] = 0.8;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

  mat = new THREE.PointsMaterial({
    size: 0.07,
    map: tex,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  points = new THREE.Points(geo, mat);
  scene.add(points);

  window.addEventListener("resize", onResize);
  ready = true;
  animate();
}

function onResize() {
  if (!ready || !containerEl) return;
  const w = Math.max(containerEl.clientWidth, 320);
  const h = Math.max(containerEl.clientHeight, 320);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function animate() {
  animId = requestAnimationFrame(animate);
  if (!ready) return;

  const posAttr = geo.getAttribute("position");
  const colAttr = geo.getAttribute("color");

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < 3; j++) {
      const idx = i * 3 + j;
      posAttr.array[idx] += (tgt[idx] - posAttr.array[idx]) * 0.08;
      colAttr.array[idx] += (tcol[idx] - colAttr.array[idx]) * 0.06;
    }
  }
  posAttr.needsUpdate = true;
  colAttr.needsUpdate = true;

  if (visible) {
    rotY += 0.006;
    points.rotation.y = rotY;
    points.rotation.x = Math.sin(rotY * 0.35) * 0.12;
    renderer.render(scene, camera);
  }
}

/**
 * mode: volume_x | volume_y | surface
 */
function morphSolid(assignment, modeResult) {
  const { f, a, b } = sampleCurve(assignment, 2);
  const mode = modeResult?.mode || "volume_x";
  const C = new THREE.Color();
  const span = Math.max(b - a, 1e-6);

  let maxR = 0.05;
  const probe = 100;
  for (let i = 0; i <= probe; i++) {
    const x = a + (span * i) / probe;
    const y = f(x);
    if (!Number.isFinite(y)) continue;
    maxR = Math.max(maxR, Math.abs(y), Math.abs(x));
  }
  const scale = 5.2 / (maxR * 2 || 1);
  const xMid = (a + b) / 2;

  mat.size = mode === "surface" ? 0.055 : 0.072;

  for (let i = 0; i < N; i++) {
    const x = a + span * Math.random();
    const fx = f(x);
    if (!Number.isFinite(fx)) {
      tgt[i * 3] = tgt[i * 3 + 1] = tgt[i * 3 + 2] = 0;
      continue;
    }

    const theta = Math.random() * Math.PI * 2;
    let px;
    let py;
    let pz;

    if (mode === "volume_y") {
      // Capas: disco horizontal a altura y=f(x) con radio |x|
      const R = Math.abs(x);
      const rr = R * Math.sqrt(Math.random());
      px = rr * Math.cos(theta);
      py = fx;
      pz = rr * Math.sin(theta);
    } else if (mode === "surface") {
      // Cáscara cerca de |f(x)| girando en x
      const R = Math.abs(fx);
      const rr = R * (0.94 + 0.06 * Math.random());
      px = x;
      py = rr * Math.cos(theta);
      pz = rr * Math.sin(theta);
    } else {
      // Volumen eje x (discos): relleno del disco de radio |f(x)|
      const R = Math.abs(fx);
      const rr = R * Math.sqrt(Math.random());
      px = x;
      py = rr * Math.cos(theta);
      pz = rr * Math.sin(theta);
    }

    tgt[i * 3] = (px - (mode === "volume_y" ? 0 : xMid)) * scale;
    tgt[i * 3 + 1] = py * scale * (mode === "volume_y" ? 1 : 1);
    tgt[i * 3 + 2] = pz * scale;

    const shade =
      mode === "volume_y"
        ? Math.min(1, Math.hypot(px, pz) / (maxR || 1))
        : Math.min(1, Math.hypot(py, pz) / (maxR || 1));
    // blush → lavender
    C.setHSL(0.92 - shade * 0.2, 0.58, 0.52 + shade * 0.18);
    setCol(i, C);
  }

  camera.position.set(0, 1.35, 8.6);
  camera.lookAt(0, 0, 0);
}

export function showParticleSolid(assignment, modeResult) {
  ensureInit("plot3d");
  visible = true;
  containerEl?.classList.remove("hidden");
  if (titleEl) titleEl.textContent = modeResult?.title || "Sólido de revolución";
  morphSolid(assignment, modeResult);
  onResize();
}

export function hideParticleSolid() {
  visible = false;
}
