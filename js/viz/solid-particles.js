import { sampleCurve } from "../math/index.js";

/**
 * Three.js particle solid of revolution — inspired by the professor demo,
 * driven by the assigned f(x) and [a,b], Greicy palette.
 */
const N = 14000;
const ROT_SPEED = 0.014; // un poco más rápido que antes (0.006)

let ready = false;
let scene, camera, renderer, points, geo, mat;
let axisGroup = null;
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

function makeAxisLabel(text, color) {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 64;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 128, 64);
  ctx.font = "600 36px Nunito, Segoe UI, sans-serif";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.55;
  ctx.fillText(text, 64, 32);
  const tex = new THREE.CanvasTexture(c);
  const matSprite = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    opacity: 0.7,
  });
  const sprite = new THREE.Sprite(matSprite);
  sprite.scale.set(0.9, 0.45, 1);
  return sprite;
}

function makeWatermarkAxes(length = 4.2) {
  const group = new THREE.Group();
  group.name = "watermark-axes";

  const mkLine = (to, colorHex) => {
    const geoLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      to,
    ]);
    const matLine = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    return new THREE.Line(geoLine, matLine);
  };

  // Ejes sutiles (marca de agua)
  group.add(mkLine(new THREE.Vector3(length, 0, 0), 0xffb7c9)); // x
  group.add(mkLine(new THREE.Vector3(0, length, 0), 0xc9b6e4)); // y
  group.add(mkLine(new THREE.Vector3(0, 0, length), 0xa8d4ff)); // z
  group.add(mkLine(new THREE.Vector3(-length * 0.35, 0, 0), 0xffb7c9));
  group.add(mkLine(new THREE.Vector3(0, -length * 0.2, 0), 0xc9b6e4));
  group.add(mkLine(new THREE.Vector3(0, 0, -length * 0.35), 0xa8d4ff));

  // Rejilla suave en plano XZ
  const grid = new THREE.GridHelper(length * 1.6, 8, 0xffffff, 0xffffff);
  grid.material.transparent = true;
  grid.material.opacity = 0.07;
  grid.material.depthWrite = false;
  group.add(grid);

  const lx = makeAxisLabel("x", "rgba(255,200,220,0.95)");
  lx.position.set(length + 0.35, 0.05, 0);
  group.add(lx);

  const ly = makeAxisLabel("y", "rgba(220,200,255,0.95)");
  ly.position.set(0.1, length + 0.35, 0);
  group.add(ly);

  const lz = makeAxisLabel("z", "rgba(180,220,255,0.95)");
  lz.position.set(0, 0.05, length + 0.35);
  group.add(lz);

  return group;
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

  axisGroup = makeWatermarkAxes(4.2);
  scene.add(axisGroup);

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
    rotY += ROT_SPEED;
    points.rotation.y = rotY;
    points.rotation.x = Math.sin(rotY * 0.35) * 0.12;
    // Ejes fijos (marca de agua): no rotan con el sólido
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
      const R = Math.abs(x);
      const rr = R * Math.sqrt(Math.random());
      px = rr * Math.cos(theta);
      py = fx;
      pz = rr * Math.sin(theta);
    } else if (mode === "surface") {
      const R = Math.abs(fx);
      const rr = R * (0.94 + 0.06 * Math.random());
      px = x;
      py = rr * Math.cos(theta);
      pz = rr * Math.sin(theta);
    } else {
      const R = Math.abs(fx);
      const rr = R * Math.sqrt(Math.random());
      px = x;
      py = rr * Math.cos(theta);
      pz = rr * Math.sin(theta);
    }

    tgt[i * 3] = (px - (mode === "volume_y" ? 0 : xMid)) * scale;
    tgt[i * 3 + 1] = py * scale;
    tgt[i * 3 + 2] = pz * scale;

    const shade =
      mode === "volume_y"
        ? Math.min(1, Math.hypot(px, pz) / (maxR || 1))
        : Math.min(1, Math.hypot(py, pz) / (maxR || 1));
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
  requestAnimationFrame(() => {
    morphSolid(assignment, modeResult);
    onResize();
    if (renderer && scene && camera) renderer.render(scene, camera);
  });
}

export function hideParticleSolid() {
  visible = false;
}
