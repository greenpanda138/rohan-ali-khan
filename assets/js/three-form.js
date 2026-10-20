// The Form — an interactive twisted ribbon, after the sculpture on Rohan's
// Form / Fiction cover. Pointer-driven only: drag to turn, no auto-rotation.
// Renders on demand; static cover poster remains if WebGL is unavailable
// or the visitor prefers reduced motion.
import * as THREE from "./three.module.min.js";

const stage = document.querySelector(".stage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (stage && !reduceMotion) {
  try { init(); } catch (e) { /* poster stays */ }
}

function init() {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-label", "Interactive 3D ribbon sculpture — drag to turn it");
  stage.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x2c0f1a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.4, 7.2);

  // Ribbon: a closed, twisted band built as a parametric surface.
  const U = 260, V = 14, R = 1.55, W = 0.62;
  const pos = [], idx = [];
  for (let i = 0; i <= U; i++) {
    const u = (i / U) * Math.PI * 2;
    const cu = Math.cos(u), su = Math.sin(u);
    const half = u / 2, ch = Math.cos(half), sh = Math.sin(half);
    for (let j = 0; j <= V; j++) {
      const v = (j / V - 0.5) * 2 * W;
      pos.push((R + v * ch) * cu, (R + v * ch) * su, v * sh);
    }
  }
  for (let i = 0; i < U; i++) {
    for (let j = 0; j < V; j++) {
      const a = i * (V + 1) + j, b = a + V + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  const ribbon = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color: 0xf4ecdc, roughness: 0.32, metalness: 0.08, side: THREE.DoubleSide })
  );
  const group = new THREE.Group();
  group.add(ribbon);
  group.rotation.set(-0.9, 0.4, 0.15);
  scene.add(group);

  scene.add(new THREE.AmbientLight(0x40333a, 1.4));
  const key = new THREE.DirectionalLight(0xfff2dd, 2.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd9577a, 1.6);
  rim.position.set(-4, -2, -3);
  scene.add(rim);

  // Interaction state — drag with inertia; render only while something moves.
  let dragging = false, px = 0, py = 0;
  let vx = 0, vy = 0, intro = 1; // intro: one gentle settle when it first appears
  let raf = null, visible = true;

  function render() {
    renderer.render(scene, camera);
  }
  function tick() {
    raf = null;
    if (!dragging) {
      group.rotation.y += vx; group.rotation.x += vy;
      vx *= 0.94; vy *= 0.94;
    }
    if (intro > 0) {
      group.rotation.y += 0.006 * intro;
      intro = Math.max(0, intro - 0.012);
    }
    render();
    if (dragging || Math.abs(vx) > 0.0004 || Math.abs(vy) > 0.0004 || intro > 0) {
      raf = requestAnimationFrame(tick);
    }
  }
  function wake() { if (!raf && visible) raf = requestAnimationFrame(tick); }

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true; px = e.clientX; py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    wake();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    group.rotation.y += dx * 0.008;
    group.rotation.x += dy * 0.008;
    vx = dx * 0.008; vy = dy * 0.008;
    wake();
  });
  const end = () => { dragging = false; wake(); };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  }
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible) wake();
  }).observe(stage);

  resize();
  stage.classList.add("live");
  wake();
}
