const FRAME_COUNT = 120;
const FRAME_PATH = (i) =>
  `compressed/ezgif-frame-${String(i).padStart(3, "0")}.png`;

// Higher = snappier. 0.18–0.25 feels smooth.
const LERP = 0.2;

const canvas = document.getElementById("frames");
const ctx = canvas.getContext("2d");
const scene = document.querySelector(".scroll-scene");
const overlays = Array.from(document.querySelectorAll(".overlay-card"));
const routeFill = document.getElementById("routeFill");

const images = [];
let targetFrame = 1;
let displayedFrame = 1;
let lastDrawn = -1;
let progress = 0;
let rafId = null;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  lastDrawn = -1;
  drawFrame(Math.round(displayedFrame));
}

function drawFrame(index) {
  const img = images[index - 1];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
  lastDrawn = index;
}

function preload() {
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = FRAME_PATH(i);
    img.onload = () => {
      if (i === 1) drawFrame(1);
    };
    images.push(img);
  }
}

function updateOverlays() {
  for (const el of overlays) {
    const start = parseFloat(el.dataset.start);
    const end = parseFloat(el.dataset.end);
    const active = progress >= start && progress <= end;
    el.classList.toggle("is-active", active);
  }
  if (routeFill) {
    routeFill.style.width = (progress * 100).toFixed(2) + "%";
  }
}

function tick() {
  const diff = targetFrame - displayedFrame;
  if (Math.abs(diff) < 0.01) {
    displayedFrame = targetFrame;
  } else {
    displayedFrame += diff * LERP;
  }

  const idx = Math.min(
    FRAME_COUNT,
    Math.max(1, Math.round(displayedFrame))
  );
  if (idx !== lastDrawn) drawFrame(idx);

  if (displayedFrame !== targetFrame) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
  }
}

function onScroll() {
  const rect = scene.getBoundingClientRect();
  const total = scene.offsetHeight - window.innerHeight;
  progress = Math.min(Math.max(-rect.top / total, 0), 1);
  targetFrame = 1 + progress * (FRAME_COUNT - 1);
  updateOverlays();
  if (rafId === null) rafId = requestAnimationFrame(tick);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", onScroll, { passive: true });

resizeCanvas();
preload();
onScroll();
