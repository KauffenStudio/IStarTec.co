/* iStarTec — guided tour of a photoreal villa (/equipamentos/, /en/equipment/)
 *
 * Each scene is a photorealistic image (generated with Higgsfield from the
 * manufacturers' product photos) plus a depth map (Depth Anything V2, made
 * offline). A shader shifts the image by its depth as the pointer moves, so
 * the photo reads as 3D. Hotspots sit on the real equipment and open the
 * product panel; products that have a GLB model can be turned around in 3D.
 * Scenes with a "before" image get a construction / finished slider.
 *
 * Copy and scene data come from the page's JSON block #eq-data.
 * Build: cd _src/equipamentos && npm install && npm run build
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const DATA = JSON.parse(document.getElementById('eq-data').textContent);
const UI = DATA.ui;
const TOUR = DATA.tour;
const MODELS = '/assets/equipamentos/models/';

const viewer = document.getElementById('eqViewer');
const canvas = document.getElementById('eqCanvas');
const poster = viewer.querySelector('.eq-viewer__poster');
const hsLayer = document.getElementById('eqHotspots');
const panel = document.getElementById('eqPanel');
const loaderTxt = viewer.querySelector('.eq-loader__txt');
const loaderBar = viewer.querySelector('.eq-loader__bar span');
const sysNav = document.getElementById('eqSystems');
const sceneNav = document.getElementById('eqScenes');
const caption = viewer.querySelector('.eq-caption');
const splitEl = viewer.querySelector('.eq-split');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = () => viewer.clientWidth < 760;

const state = {
  scene: 0,
  focus: null,
  part: null,
  variant: { solar: 'tss300', bomba: 'awf1' },
  split: 0.5,
  webgl: true,
  lastTrigger: null,
};

/* ───────────────────────── panel ───────────────────────── */
const ICON = {
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  cube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m12 12 8-4.5M12 12v9M12 12 4 7.5"/></svg>',
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function currentVariant(id) {
  const sys = DATA.systems[id];
  if (!sys.variants) return null;
  const v = state.variant[id] || sys.variants[0].id;
  return sys.variants.find((x) => x.id === v) || sys.variants[0];
}
function partsFor(id) {
  const v = currentVariant(id);
  return (DATA.systems[id].parts || []).filter((p) => !p.variants || (v && p.variants.includes(v.id)));
}
/* GLB available for the system in its current variant? */
function modelFor(id) {
  const v = currentVariant(id);
  const m = (v && v.model) || DATA.systems[id].model;
  return m || null;
}

function renderPanel(id) {
  const act = document.activeElement;
  let refocus = null;
  if (act && panel.contains(act)) {
    for (const k of ['eqPart', 'eqVariant']) if (act.dataset[k]) refocus = `[data-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}="${act.dataset[k]}"]`;
    if (act.hasAttribute('data-eq-part-clear')) refocus = '.eq-parts__btn';
    if (act.hasAttribute('data-eq-model')) refocus = '[data-eq-model]';
  }
  const sys = DATA.systems[id];
  const v = currentVariant(id);
  const photo = (v && v.photo) || sys.photo;
  const photoAlt = (v && v.photoAlt) || sys.photoAlt;
  const specs = [...((v && v.specs) || []), ...(sys.specs || [])];
  const parts = partsFor(id);
  const part = state.part ? parts.find((p) => p.id === state.part) : null;

  let html = `
    <div class="eq-panel__head">
      <div>
        <span class="eq-panel__brand">${esc(sys.brand)}</span>
        <h2 class="eq-panel__title" id="eqPanelTitle" tabindex="-1">${esc(sys.title)}</h2>
      </div>
      <button type="button" class="eq-icon-btn eq-panel__close" data-eq-close aria-label="${esc(UI.close)}">${ICON.close}</button>
    </div>
    <div class="eq-panel__body">`;
  if (part) {
    html += `<div class="eq-part-card" aria-live="polite"><span class="eq-part-card__eyebrow">${esc(UI.component)}</span>
      <h3>${esc(part.label)}</h3><p>${esc(part.text)}</p>
      <button type="button" class="eq-link-btn" data-eq-part-clear>${esc(UI.backToSystem)}</button></div>`;
  }
  if (photo) {
    html += `<figure class="eq-panel__photo"><img src="${esc(photo)}" alt="${esc(photoAlt || sys.title)}" width="900" height="675" decoding="async" />
      <figcaption>${esc(UI.photoBy)} ${esc(sys.photoCredit || sys.brand)}</figcaption></figure>`;
  }
  if (modelFor(id) && state.webgl) {
    html += `<button type="button" class="eq-toggle eq-toggle--3d" data-eq-model>${ICON.cube}<span>${esc(UI.view3d)}</span></button>`;
  }
  html += `<p class="eq-panel__lead">${esc(sys.lead)}</p>`;
  if (sys.variants) {
    html += `<div class="eq-field"><span class="eq-field__label" id="eqVarLbl">${esc(UI.model)}</span><div class="eq-seg" role="radiogroup" aria-labelledby="eqVarLbl">`;
    for (const x of sys.variants) {
      const on = v && x.id === v.id;
      html += `<button type="button" role="radio" aria-checked="${on}" class="eq-seg__btn${on ? ' is-on' : ''}" data-eq-variant="${esc(x.id)}">${esc(x.label)}</button>`;
    }
    html += `</div></div>`;
  }
  if (parts.length) {
    html += `<h3 class="eq-panel__h">${esc(UI.parts)}</h3><ul class="eq-parts">`;
    parts.forEach((p, i) => {
      const on = state.part === p.id;
      html += `<li><button type="button" class="eq-parts__btn${on ? ' is-on' : ''}" data-eq-part="${esc(p.id)}" aria-pressed="${on}"><span class="eq-parts__n">${i + 1}</span>${esc(p.label)}</button></li>`;
    });
    html += `</ul>`;
  }
  if (specs.length) {
    html += `<h3 class="eq-panel__h">${esc(UI.specs)}</h3><dl class="eq-specs">`;
    for (const [k, val] of specs) html += `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`;
    html += `</dl>`;
  }
  html += `<div class="eq-panel__cta">`;
  for (const l of sys.links || []) html += `<a class="eq-btn eq-btn--ghost" href="${esc(l.href)}">${esc(l.label)}</a>`;
  html += `<a class="eq-btn eq-btn--primary" href="${esc(DATA.quote.href)}">${esc(DATA.quote.label)} ${ICON.arrow}</a></div></div>`;

  panel.innerHTML = html;
  panel.dataset.system = id;
  if (refocus) panel.querySelector(refocus)?.focus({ preventScroll: true });
}

function openPanel(id) {
  state.focus = id;
  renderPanel(id);
  panel.hidden = false;
  viewer.classList.add('has-panel');
  document.body.classList.add('eq-panel-open');
  requestAnimationFrame(() => panel.classList.add('is-open'));
  panel.querySelector('#eqPanelTitle')?.focus({ preventScroll: true });
  syncNav(id);
  history.replaceState(null, '', '#' + id);
  track('equipamento_3d', id);
  refreshHotspots();
  api?.focusOn(id, null);
}
function closePanel() {
  state.focus = null;
  state.part = null;
  panel.classList.remove('is-open');
  viewer.classList.remove('has-panel');
  document.body.classList.remove('eq-panel-open');
  setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 260);
  syncNav(null);
  history.replaceState(null, '', location.pathname + location.search);
  refreshHotspots();
  api?.unfocus();
  if (state.lastTrigger && document.contains(state.lastTrigger)) state.lastTrigger.focus({ preventScroll: true });
}
function syncNav(id) {
  sysNav?.querySelectorAll('[data-eq-open]').forEach((b) => {
    const on = b.dataset.eqOpen === id;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on);
  });
}
function track(name, label) {
  try { if (typeof window.gtag === 'function') window.gtag('event', name, { event_category: 'engagement', event_label: label }); } catch (e) {}
}

/* ───────────────────────── scene helpers (shared by WebGL + fallback) ───────────────────────── */
const scenes = TOUR.scenes;
function sceneIndexFor(sysId) {
  const i = scenes.findIndex((s) => s.hotspots.some((h) => h.sys === sysId && !h.part));
  return i;
}
function renderSceneNav() {
  if (!sceneNav) return;
  sceneNav.querySelectorAll('[data-eq-scene]').forEach((b) => {
    const on = Number(b.dataset.eqScene) === state.scene;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-current', on ? 'step' : 'false');
  });
  const s = scenes[state.scene];
  if (caption) caption.innerHTML = `<span class="eq-caption__n">${state.scene + 1}/${scenes.length}</span> ${esc(s.title)}`;
  viewer.classList.toggle('has-split', !!s.before);
}

/* hotspot DOM for the current scene */
let hsEls = [];
function refreshHotspots() {
  hsEls.forEach((h) => h.el.remove());
  hsEls = [];
  const s = scenes[state.scene];
  let n = 0;
  for (const h of s.hotspots) {
    const sys = DATA.systems[h.sys];
    if (!sys) continue;
    const isPart = !!h.part;
    // part dots only appear while their system is open
    if (isPart && state.focus !== h.sys) continue;
    let label = sys.short || sys.title;
    if (isPart) {
      const p = partsFor(h.sys).find((x) => x.id === h.part);
      if (!p) continue;
      label = p.label;
    }
    n += 1;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'eq-hs' + (isPart ? ' eq-hs--part' : '') + (isPart && state.part === h.part ? ' is-on' : '') + (!isPart && state.focus === h.sys ? ' is-active' : '');
    b.setAttribute('aria-label', isPart ? label : `${UI.open} ${label}`);
    b.innerHTML = `<span class="eq-hs__dot">${isPart ? n : '+'}</span><span class="eq-hs__label">${esc(label)}</span>`;
    b.addEventListener('click', () => {
      state.lastTrigger = b;
      if (isPart) selectPart(h.part);
      else if (state.focus === h.sys) closePanel();
      else { state.part = null; openPanel(h.sys); }
    });
    hsLayer.appendChild(b);
    hsEls.push({ el: b, x: h.x, y: h.y });
  }
  hsLayer.classList.toggle('has-part', !!state.part);
  placeHotspots();
}
function selectPart(pid) {
  state.part = state.part === pid ? null : pid;
  renderPanel(state.focus);
  refreshHotspots();
  api?.focusOn(state.focus, state.part);
  panel.querySelector('.eq-part-card')?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
}

/* image-space (0..1) -> viewer pixels, using the same "cover" fit as the shader */
let placeHotspots = () => {};
const pan = { v: 0, t: 0 }; // horizontal pan across a cropped photo, -1..1
function coverParams(imgAspect, w, h, zoom = 1, panV = 0) {
  const va = w / h;
  let sx = 1, sy = 1;
  if (va > imgAspect) sy = imgAspect / va; else sx = va / imgAspect;
  sx /= zoom; sy /= zoom;
  return { sx, sy, ox: ((1 - sx) / 2) * (1 + panV), oy: (1 - sy) / 2 };
}
function panToCenter(imgX, s, w, h) {
  const c = coverParams(s.aspect, w, h, 1.06);
  const room = (1 - c.sx) / 2;
  if (room < 0.01) return 0;
  return Math.max(-1, Math.min(1, (imgX - c.sx / 2) / room - 1));
}

/* ───────────────────────── UI wiring ───────────────────────── */
let api = null; // set by the WebGL path
function goScene(i, opts) {
  i = (i + scenes.length) % scenes.length;
  if (i === state.scene && !opts?.force) return;
  if (api) api.goScene(i);
  else { state.scene = i; fallbackShow(); }
}
function openSystem(id) {
  const si = sceneIndexFor(id);
  if (si >= 0 && si !== state.scene) goScene(si);
  state.part = null;
  openPanel(id);
}

panel.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.hasAttribute('data-eq-close')) closePanel();
  else if (t.dataset.eqVariant) {
    state.variant[panel.dataset.system] = t.dataset.eqVariant;
    state.part = null;
    renderPanel(panel.dataset.system);
    refreshHotspots();
    if (api && api.productOpen()) api.openProduct(panel.dataset.system);
    track('equipamento_3d_modelo', `${panel.dataset.system}:${t.dataset.eqVariant}`);
  } else if (t.dataset.eqPart) selectPart(t.dataset.eqPart);
  else if (t.hasAttribute('data-eq-part-clear')) selectPart(state.part);
  else if (t.hasAttribute('data-eq-model') && api) { state.lastTrigger = t; api.openProduct(panel.dataset.system); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (api && api.productOpen()) api.closeProduct();
    else if (panel.classList.contains('is-open')) closePanel();
  }
  if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && viewer.contains(document.activeElement) && !panel.contains(document.activeElement) && document.activeElement !== splitEl) {
    goScene(state.scene + (e.key === 'ArrowRight' ? 1 : -1));
  }
});
sysNav?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-eq-open]');
  if (!b) return;
  state.lastTrigger = b;
  if (state.focus === b.dataset.eqOpen) closePanel(); else openSystem(b.dataset.eqOpen);
});
sceneNav?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-eq-scene]');
  if (b) goScene(Number(b.dataset.eqScene));
});
viewer.querySelector('[data-eq-tool="full"]')?.addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const on = !(document.fullscreenElement === viewer || viewer.classList.contains('is-full'));
  if (on) {
    if (viewer.requestFullscreen) viewer.requestFullscreen().catch(() => viewer.classList.add('is-full'));
    else viewer.classList.add('is-full');
  } else if (document.fullscreenElement) document.exitFullscreen();
  else viewer.classList.remove('is-full');
  btn.setAttribute('aria-pressed', on);
});
viewer.querySelectorAll('[data-eq-step]').forEach((b) => b.addEventListener('click', () => goScene(state.scene + Number(b.dataset.eqStep))));
/* catalogue buttons ("Ver na visita" / "Ver em 3D"), also inside the product sheet dialog */
function showFromCatalogue(id, v, model3d, trigger) {
  if (!DATA.systems[id]) return;
  if (trigger) state.lastTrigger = trigger;
  if (v && DATA.systems[id].variants) state.variant[id] = v;
  viewer.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  openSystem(id);
  if (model3d && api && modelFor(id)) setTimeout(() => api.openProduct(id), reduceMotion ? 0 : 500);
}
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('[data-eq-show]');
  if (!b) return;
  showFromCatalogue(b.dataset.eqShow, b.dataset.eqVariant, b.hasAttribute('data-eq-3d'), b);
});
window.__eqTour = true;
function runPending() {
  const p = window.__eqPending;
  if (!p) return;
  window.__eqPending = null;
  showFromCatalogue(p.id, p.v, p.model3d, null);
}

/* before/after slider (pointer + keyboard) */
let setSplit = () => {};
let sweepSplit = () => {};
if (splitEl) {
  let dragging = false;
  setSplit = (v) => {
    state.split = Math.min(0.98, Math.max(0.02, v));
    splitEl.style.left = (state.split * 100).toFixed(2) + '%';
    splitEl.setAttribute('aria-valuenow', Math.round(state.split * 100));
    if (!api) fallbackSplit();
  };
  const fromEvent = (e) => {
    const r = viewer.getBoundingClientRect();
    setSplit((e.clientX - r.left) / r.width);
  };
  const stop = () => { dragging = false; viewer.classList.remove('is-splitting'); };
  splitEl.addEventListener('pointerdown', (e) => {
    dragging = true; sweepT = null;
    viewer.classList.add('is-splitting');
    try { splitEl.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault(); e.stopPropagation();
  });
  splitEl.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
  splitEl.addEventListener('pointerup', stop);
  splitEl.addEventListener('pointercancel', stop);
  splitEl.addEventListener('lostpointercapture', stop);
  // with a mouse, dragging anywhere on the photo moves the divider too
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || !scenes[state.scene].before) return;
    dragging = true; sweepT = null;
    viewer.classList.add('is-splitting');
    fromEvent(e);
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });
  canvas.addEventListener('pointermove', (e) => { if (dragging && e.pointerType === 'mouse') fromEvent(e); });
  canvas.addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse') stop(); });
  splitEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { setSplit(state.split - 0.05); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setSplit(state.split + 0.05); e.preventDefault(); }
  });
  // a short sweep when a before/after scene opens, so people see it moves
  let sweepT = null;
  sweepSplit = () => {
    if (reduceMotion) { setSplit(0.5); return; }
    sweepT = performance.now();
    const step = (now) => {
      if (sweepT === null) return;
      const t = (now - sweepT) / 1800;
      if (t >= 1) { setSplit(0.5); sweepT = null; return; }
      setSplit(0.5 + Math.sin(t * Math.PI * 2) * 0.18 * (1 - t));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  setSplit(0.5);
}

/* ───────────────────────── fallback (no WebGL): plain images ───────────────────────── */
function fallbackShow() {
  const s = scenes[state.scene];
  poster.src = s.img;
  poster.alt = s.alt || s.title;
  let before = viewer.querySelector('.eq-viewer__before');
  if (s.before) {
    if (!before) {
      before = document.createElement('img');
      before.className = 'eq-viewer__poster eq-viewer__before';
      before.alt = '';
      poster.after(before);
    }
    before.src = s.before;
    fallbackSplit();
    sweepSplit();
  } else if (before) before.remove();
  renderSceneNav();
  refreshHotspots();
}
function fallbackSplit() {
  const b = viewer.querySelector('.eq-viewer__before');
  if (b) b.style.clipPath = `inset(0 ${(100 - state.split * 100).toFixed(2)}% 0 0)`;
}
function fallbackPlace() {
  const w = viewer.clientWidth, h = viewer.clientHeight;
  const s = scenes[state.scene];
  const c = coverParams(s.aspect, w, h);
  for (const hs of hsEls) {
    const x = ((hs.x - c.ox) / c.sx) * w, y = ((hs.y - c.oy) / c.sy) * h;
    hs.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    hs.el.classList.toggle('is-hidden', x < 8 || y < 8 || x > w - 8 || y > h - 8);
  }
}

function hasWebGL() {
  try { return !!(window.WebGL2RenderingContext && document.createElement('canvas').getContext('webgl2')); } catch (e) { return false; }
}

if (!hasWebGL()) {
  state.webgl = false;
  viewer.dataset.state = 'fallback';
  placeHotspots = fallbackPlace;
  new ResizeObserver(fallbackPlace).observe(viewer);
  fallbackShow();
  bootHash();
  runPending();
} else {
  initWebGL();
}

function bootHash() {
  const h = location.hash.replace('#', '');
  if (DATA.systems[h]) openSystem(h);
}

/* ═════════════════════════ WebGL tour ═════════════════════════ */
function initWebGL() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const texLoader = new THREE.TextureLoader();

  const blank = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
  blank.needsUpdate = true;

  const uniforms = {
    uImgA: { value: blank }, uDepA: { value: blank }, uBefA: { value: blank }, uHasBefA: { value: 0 }, uCovA: { value: new THREE.Vector4(1, 1, 0, 0) },
    uImgB: { value: blank }, uDepB: { value: blank }, uBefB: { value: blank }, uHasBefB: { value: 0 }, uCovB: { value: new THREE.Vector4(1, 1, 0, 0) },
    uMix: { value: 0 }, uZoomA: { value: 1 }, uZoomB: { value: 1 }, uFocus: { value: new THREE.Vector2(0.5, 0.5) },
    uMouse: { value: new THREE.Vector2() }, uStrength: { value: 0.03 }, uSplit: { value: 0.5 },
    uZoomF: { value: 1 }, uFocusF: { value: new THREE.Vector2(0.5, 0.5) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uImgA, uDepA, uBefA, uImgB, uDepB, uBefB;
      uniform float uHasBefA, uHasBefB, uMix, uZoomA, uZoomB, uStrength, uSplit;
      uniform vec4 uCovA, uCovB;
      uniform vec2 uMouse, uFocus, uFocusF;
      uniform float uZoomF;
      vec3 shot(sampler2D img, sampler2D dep, sampler2D bef, float hasBef, vec4 cov, float zoom, vec2 screenUv){
        vec2 sv = uFocusF + (screenUv - uFocusF) / uZoomF;
        vec2 s = uFocus + (sv - uFocus) / zoom;
        vec2 uv = s * cov.xy + cov.zw;
        // three-step parallax: walk the offset towards the sampled depth to limit smearing
        vec2 off = uMouse * uStrength;
        float d = texture2D(dep, uv).r;
        vec2 p = uv + off * (d - 0.4);
        d = texture2D(dep, p).r;
        p = uv + off * (d - 0.4);
        d = texture2D(dep, p).r;
        p = uv + off * (d - 0.4);
        p = clamp(p, vec2(0.001), vec2(0.999));
        vec3 c = texture2D(img, p).rgb;
        if (hasBef > 0.5 && screenUv.x < uSplit) c = texture2D(bef, p).rgb;
        return c;
      }
      void main(){
        vec3 a = shot(uImgA, uDepA, uBefA, uHasBefA, uCovA, uZoomA, vUv);
        vec3 col = a;
        if (uMix > 0.001) {
          vec3 b = shot(uImgB, uDepB, uBefB, uHasBefB, uCovB, uZoomB, vUv);
          col = mix(a, b, smoothstep(0.0, 1.0, uMix));
        }
        // soft vignette
        vec2 q = vUv - 0.5;
        col *= 1.0 - dot(q, q) * 0.28;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
    depthTest: false, depthWrite: false,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  /* scene assets: color, depth (also read on CPU for pinning hotspots), before */
  const cache = {};
  function loadTex(url, color = true) {
    return new Promise((res) => texLoader.load(url, (t) => {
      t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
      res(t);
    }, undefined, () => res(null)));
  }
  function readDepth(tex) {
    try {
      const img = tex.image, c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      return { w: c.width, h: c.height, data: g.getImageData(0, 0, c.width, c.height).data };
    } catch (e) { return null; }
  }
  function ensure(i, onProgress) {
    if (cache[i]) return cache[i];
    const s = scenes[i];
    const small = isSmall();
    const img = (small && s.imgSmall) || s.img, bef = (small && s.beforeSmall) || s.before;
    const jobs = [loadTex(img), loadTex(s.depth, false), bef ? loadTex(bef) : Promise.resolve(null)];
    let done = 0;
    jobs.forEach((p) => p.then(() => { done += 1; onProgress?.(done / jobs.length); }));
    cache[i] = Promise.all(jobs).then(([img, dep, bef]) => ({ img, dep, bef, depthData: dep ? readDepth(dep) : null }));
    return cache[i];
  }
  function depthAt(set, x, y) {
    const d = set && set.depthData;
    if (!d) return 0.4;
    const px = Math.min(d.w - 1, Math.max(0, Math.round(x * (d.w - 1))));
    const py = Math.min(d.h - 1, Math.max(0, Math.round(y * (d.h - 1))));
    return d.data[(py * d.w + px) * 4] / 255;
  }

  let cur = null, nxt = null, trans = null;
  function setSlot(slot, set, s) {
    const u = slot === 'A' ? 'A' : 'B';
    uniforms['uImg' + u].value = set.img || blank;
    uniforms['uDep' + u].value = set.dep || blank;
    uniforms['uBef' + u].value = set.bef || blank;
    uniforms['uHasBef' + u].value = set.bef ? 1 : 0;
    uniforms['uCov' + u].value.copy(coverVec(s));
  }
  function coverVec(s) {
    const c = coverParams(s.aspect, canvas.clientWidth || 1, canvas.clientHeight || 1, 1.06, pan.v);
    return new THREE.Vector4(c.sx, c.sy, c.ox, c.oy);
  }

  async function goSceneGL(i) {
    const target = (i + scenes.length) % scenes.length;
    const set = await ensure(target);
    if (trans) { // finish the running transition first
      uniforms.uMix.value = 0; uniforms.uZoomA.value = 1;
    }
    const from = state.scene;
    nxt = { set, i: target };
    setSlot('B', set, scenes[target]);
    const dir = target > from ? 1 : -1;
    uniforms.uFocus.value.set(0.5 + dir * 0.12, 0.55);
    trans = { t: 0, dur: reduceMotion ? 0.01 : 1.1 };
    state.scene = target;
    state.part = null;
    if (state.focus && !scenes[target].hotspots.some((h) => h.sys === state.focus)) closePanel();
    renderSceneNav();
    refreshHotspots();
    pan.t = panToCenter(scenes[target].centerX ?? 0.5, scenes[target], viewer.clientWidth, viewer.clientHeight);
    if (scenes[target].before) setTimeout(sweepSplit, reduceMotion ? 0 : 1100);
    if (state.focus) focusOn(state.focus, state.part); else unfocus();
    // warm up neighbours
    ensure((target + 1) % scenes.length);
    ensure((target - 1 + scenes.length) % scenes.length);
    track('equipamento_3d_cena', scenes[target].id);
  }

  /* pointer parallax, gentle idle drift, touch drag */
  const mouse = new THREE.Vector2(), mouseT = new THREE.Vector2();
  let lastMove = 0;
  viewer.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = viewer.getBoundingClientRect();
    mouseT.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    lastMove = performance.now();
  });
  let touch0 = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    touch0 = { x: e.clientX, p: pan.t };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!touch0) return;
    const w = viewer.clientWidth, h = viewer.clientHeight;
    const c = coverParams(scenes[state.scene].aspect, w, h, 1.06);
    const room = (1 - c.sx) / 2;
    if (room < 0.01) return;
    const dx = (e.clientX - touch0.x) / w;
    pan.t = Math.max(-1, Math.min(1, touch0.p - (dx * c.sx) / room));
    lastMove = performance.now();
  });
  const endTouch = () => { touch0 = null; };
  canvas.addEventListener('pointerup', endTouch);
  canvas.addEventListener('pointercancel', endTouch);
  if (matchMedia('(pointer: coarse)').matches && UI.hintTouch) {
    const hint = viewer.querySelector('.eq-hint');
    if (hint) hint.textContent = UI.hintTouch;
  }
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || touch0) return;
    mouseT.set(Math.max(-1, Math.min(1, e.gamma / 25)), Math.max(-1, Math.min(1, (e.beta - 45) / 25)));
    lastMove = performance.now();
  });

  /* hotspots follow the parallax of the surface they sit on */
  placeHotspots = () => {
    const w = viewer.clientWidth, h = viewer.clientHeight;
    const s = scenes[state.scene];
    const c = coverParams(s.aspect, w, h, 1.06, pan.v);
    const set = cur && cur.set;
    for (const hs of hsEls) {
      const d = depthAt(set, hs.x, hs.y);
      // image uv -> screen uv (inverse of the shader mapping, first-order)
      const ix = hs.x - mouse.x * uniforms.uStrength.value * (d - 0.4);
      const iy = hs.y + mouse.y * uniforms.uStrength.value * (d - 0.4);
      const sx = (ix - c.ox) / c.sx, sy = (iy - c.oy) / c.sy;
      const x = (dolly.f.x + (sx - dolly.f.x) * dolly.z) * w, y = (dolly.f.y + (sy - dolly.f.y) * dolly.z) * h;
      const flip = x > w - 230;
      hs.el.classList.toggle('is-flip', flip);
      const tx = flip ? x - (hs.el.offsetWidth || 44) + 44 : x;
      hs.el.style.transform = `translate3d(${tx.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      hs.el.classList.toggle('is-hidden', !!trans || x < 8 || y < 8 || x > w - 8 || y > h - 8);
    }
  };

  /* "dolly" towards the open equipment so it sits in the free part of the frame */
  const dolly = { z: 1, zT: 1, f: new THREE.Vector2(0.5, 0.5), fT: new THREE.Vector2(0.5, 0.5) };
  function focusOn(sysId, partId) {
    const s = scenes[state.scene];
    const h = (partId && s.hotspots.find((x) => x.sys === sysId && x.part === partId)) || s.hotspots.find((x) => x.sys === sysId && !x.part);
    if (!h) { dolly.zT = 1; return; }
    const w = viewer.clientWidth, hh = viewer.clientHeight;
    pan.t = panToCenter(h.x, s, w, hh);
    const c = coverParams(s.aspect, w, hh, 1.06, pan.t);
    const H = new THREE.Vector2((h.x - c.ox) / c.sx, (h.y - c.oy) / c.sy);
    const small = isSmall();
    const panelW = small ? 0 : Math.min(406, w * 0.45);
    // panel goes to the side away from the equipment
    const left = !small && H.x > 0.55;
    panel.classList.toggle('is-left', left);
    viewer.classList.toggle('panel-left', left);
    const T = small ? new THREE.Vector2(0.5, 0.26)
      : new THREE.Vector2(left ? (panelW + (w - panelW) / 2) / w : ((w - panelW) / 2) / w, 0.5);
    const z = partId ? (small ? 1.45 : 1.55) : (small ? 1.25 : 1.32);
    const F = T.clone().sub(H.clone().multiplyScalar(z)).divideScalar(1 - z);
    // the frame may slide under the panel (that area is covered anyway), never on the open side
    if (small) { F.x = Math.min(1, Math.max(0, F.x)); F.y = Math.min(3, Math.max(0, F.y)); }
    else if (left) { F.x = Math.min(1, Math.max(-2, F.x)); F.y = Math.min(1, Math.max(0, F.y)); }
    else { F.x = Math.min(3, Math.max(0, F.x)); F.y = Math.min(1, Math.max(0, F.y)); }
    dolly.zT = reduceMotion ? 1 : z;
    dolly.fT.copy(F);
  }
  function unfocus() { dolly.zT = 1; viewer.classList.remove('panel-left'); }

  /* ───────── product viewer (GLB, turnable) ───────── */
  const prod = createProductViewer();

  api = {
    focusOn, unfocus,
    goScene: goSceneGL,
    openProduct: (id) => prod.open(id),
    closeProduct: () => prod.close(),
    productOpen: () => prod.isOpen(),
  };

  /* resize / visibility */
  function resize() {
    const w = viewer.clientWidth, h = viewer.clientHeight;
    renderer.setSize(w, h, false);
    if (cur) uniforms.uCovA.value.copy(coverVec(scenes[state.scene]));
    placeHotspots();
  }
  new ResizeObserver(resize).observe(viewer);

  let visible = true, running = false;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; loop(); }, { rootMargin: '100px' }).observe(viewer);
  document.addEventListener('visibilitychange', loop);
  function loop() {
    const want = visible && !document.hidden;
    if (want && !running) { running = true; clock.getDelta(); renderer.setAnimationLoop(tick); }
    if (!want && running) { running = false; renderer.setAnimationLoop(null); }
  }

  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    // idle drift so the photo keeps breathing
    if (!reduceMotion && performance.now() - lastMove > 2500) {
      mouseT.set(Math.sin(t * 0.35) * 0.55, Math.sin(t * 0.23 + 1.3) * 0.35);
    }
    if (reduceMotion) mouseT.set(0, 0);
    mouse.lerp(mouseT, Math.min(1, dt * 3.2));
    uniforms.uMouse.value.copy(mouse);
    uniforms.uSplit.value = state.split;
    pan.v += (pan.t - pan.v) * Math.min(1, dt * 5);
    if (cur) uniforms.uCovA.value.copy(coverVec(scenes[cur.i]));
    if (nxt) uniforms.uCovB.value.copy(coverVec(scenes[nxt.i]));
    const k = Math.min(1, dt * 3);
    dolly.z += (dolly.zT - dolly.z) * k;
    dolly.f.lerp(dolly.fT, k);
    uniforms.uZoomF.value = dolly.z;
    uniforms.uFocusF.value.set(dolly.f.x, 1 - dolly.f.y);

    if (trans) {
      trans.t += dt / trans.dur;
      const k = Math.min(1, trans.t);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      uniforms.uMix.value = e;
      uniforms.uZoomA.value = 1 + e * 0.18;
      uniforms.uZoomB.value = 1.1 - e * 0.1;
      if (k >= 1) {
        cur = nxt; nxt = null; trans = null;
        setSlot('A', cur.set, scenes[cur.i]);
        uniforms.uMix.value = 0; uniforms.uZoomA.value = 1; uniforms.uZoomB.value = 1;
      }
    }
    renderer.render(scene, cam);
    placeHotspots();
    prod.tick(dt);
  }

  /* boot: first scene, then the hash */
  const first = 0;
  ensure(first, (p) => setProgress(p)).then((set) => {
    cur = { set, i: first };
    state.scene = first;
    pan.t = pan.v = panToCenter(scenes[first].centerX ?? 0.5, scenes[first], viewer.clientWidth, viewer.clientHeight);
    setSlot('A', set, scenes[first]);
    viewer.dataset.state = 'ready';
    renderSceneNav();
    refreshHotspots();
    loop();
    ensure(1 % scenes.length);
    bootHash();
    runPending();
    window.addEventListener('hashchange', () => {
      const h = location.hash.replace('#', '');
      if (DATA.systems[h] && h !== state.focus) openSystem(h);
    });
  });
  function setProgress(p) {
    const pct = Math.round(p * 100);
    if (loaderBar) loaderBar.style.transform = `scaleX(${Math.max(0.05, p).toFixed(3)})`;
    if (loaderTxt) loaderTxt.textContent = `${UI.loading} ${pct}%`;
  }
}

/* ═════════════════════════ product viewer ═════════════════════════ */
function createProductViewer() {
  const wrap = document.createElement('div');
  wrap.className = 'eq-3d';
  wrap.hidden = true;
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', 'eq3dTitle');
  wrap.innerHTML = `
    <div class="eq-3d__bar">
      <div><span class="eq-panel__brand" data-3d-brand></span><h2 class="eq-3d__title" id="eq3dTitle" tabindex="-1"></h2></div>
      <button type="button" class="eq-icon-btn eq-3d__close" aria-label="${esc(UI.close3d)}">${ICON.close}</button>
    </div>
    <canvas class="eq-3d__canvas" aria-hidden="true"></canvas>
    <div class="eq-3d__loading" role="status">${esc(UI.loading)}</div>
    <p class="eq-3d__hint">${esc(UI.hint3d)}</p>
    <p class="eq-3d__note">${esc(UI.note3d)}</p>`;
  viewer.appendChild(wrap);
  const cv = wrap.querySelector('canvas');
  const titleEl = wrap.querySelector('.eq-3d__title');
  const brandEl = wrap.querySelector('[data-3d-brand]');
  const loadingEl = wrap.querySelector('.eq-3d__loading');

  let renderer = null, scene, camera, controls, holder, ground;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const cache = {};
  const fans = [];
  let open = false;

  function setup() {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.75;
    camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
    controls = new OrbitControls(camera, cv);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 1.6;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 15 });
    scene.add(key);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd6df, 0.8));
    ground = new THREE.Mesh(new THREE.CircleGeometry(3, 64), new THREE.ShadowMaterial({ opacity: 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    holder = new THREE.Group();
    scene.add(holder);
    new ResizeObserver(resize).observe(wrap);
    resize();
  }
  function resize() {
    if (!renderer) return;
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function fanOverlay(r) {
    const g = new THREE.Group();
    const std = (c, ro, me, x = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...x });
    g.add(new THREE.Mesh(new THREE.CircleGeometry(r, 48), std(0x24272c, 0.8, 0)));
    const blades = new THREE.Group();
    const sh = new THREE.Shape();
    sh.moveTo(0, -r * 0.05);
    sh.quadraticCurveTo(r * 0.45, -r * 0.28, r * 0.9, -r * 0.16);
    sh.quadraticCurveTo(r * 0.94, r * 0.08, r * 0.82, r * 0.2);
    sh.quadraticCurveTo(r * 0.42, r * 0.2, 0, r * 0.05);
    const bg = new THREE.ShapeGeometry(sh, 8), bm = std(0x3a3f46, 0.55, 0.2, { side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(bg, bm); b.rotation.z = (i * Math.PI * 2) / 3; blades.add(b); }
    blades.position.z = 0.012;
    g.add(blades);
    const wire = std(0x50565e, 0.5, 0.4);
    for (let k = 1; k <= 7; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry((r * k) / 7.2, 0.0045, 4, 64), wire); t.position.z = 0.04; g.add(t); }
    for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(r * 2, 0.008, 0.008), wire); s.rotation.z = (k * Math.PI) / 4; s.position.z = 0.042; g.add(s); }
    fans.push(blades);
    return g;
  }
  function fit(root, { size, dim = 'x', rotY = 0 }) {
    const inner = new THREE.Group();
    inner.add(root);
    root.rotation.y = rotY;
    inner.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(root);
    root.scale.multiplyScalar(size / b.getSize(new THREE.Vector3())[dim]);
    inner.updateMatrixWorld(true);
    const b2 = new THREE.Box3().setFromObject(root);
    const c = b2.getCenter(new THREE.Vector3());
    root.position.x -= c.x; root.position.z -= c.z; root.position.y -= b2.min.y;
    inner.updateMatrixWorld(true);
    inner.userData.box = new THREE.Box3().setFromObject(root);
    return inner;
  }
  /* model id -> how to load and dress it */

  /* ── procedural cutaway models (no GLB needed) ── */
  const M3 = (c, r = 0.5, m = 0, x = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, side: THREE.DoubleSide, ...x });
  function cutFace(phi, r0, r1, y0, y1, mat) {
    const sx = Math.sin(phi), cz = Math.cos(phi);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      r0 * sx, y0, r0 * cz, r1 * sx, y0, r1 * cz, r1 * sx, y1, r1 * cz,
      r0 * sx, y0, r0 * cz, r1 * sx, y1, r1 * cz, r0 * sx, y1, r0 * cz,
    ], 3));
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  }
  /* a wall layer between r0 and r1, from y0 to y1, with a wedge cut away (phiLen < 2π) */
  function shell(r0, r1, y0, y1, mat, phiStart = 0, phiLen = Math.PI * 2) {
    const g = new THREE.Group();
    const pts = [new THREE.Vector2(r0, y0), new THREE.Vector2(r1, y0), new THREE.Vector2(r1, y1), new THREE.Vector2(r0, y1), new THREE.Vector2(r0, y0)];
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 72, phiStart, phiLen), mat);
    m.castShadow = true;
    g.add(m);
    if (phiLen < Math.PI * 2 - 1e-3) {
      g.add(cutFace(phiStart, r0, r1, y0, y1, mat));
      g.add(cutFace(phiStart + phiLen, r0, r1, y0, y1, mat));
    }
    return g;
  }
  function buildMulticamada() {
    const root = new THREE.Group();
    const pex = M3(0xf6f1e8, 0.45), glue = M3(0x3f444a, 0.7), alu = M3(0xe3e7ec, 0.18, 1), pexOut = M3(0xffffff, 0.35);
    // pipe: full body + stepped cutaway end showing PEX / adhesive / aluminium / adhesive / PEX
    const pipe = new THREE.Group();
    const cutStart = 0.37, cutLen = Math.PI * 1.5;
    pipe.add(shell(0.05, 0.08, -0.55, 0, pexOut));
    const layers = [[0.05, 0.062, 0.62, pex], [0.062, 0.0635, 0.55, glue], [0.0635, 0.0685, 0.48, alu], [0.0685, 0.07, 0.41, glue], [0.07, 0.08, 0.34, pexOut]];
    for (const [r0, r1, len, mat] of layers) pipe.add(shell(r0, r1, 0, len, mat, cutStart, cutLen));
    // press fitting on the far end
    pipe.add(shell(0.08, 0.095, -0.7, -0.52, M3(0xc9cdd3, 0.28, 0.9)));
    pipe.add(shell(0.03, 0.085, -0.86, -0.7, M3(0xc9a24a, 0.3, 1)));
    const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 6), M3(0xc9a24a, 0.3, 1));
    hex.position.y = -0.9; pipe.add(hex);
    pipe.rotation.z = -Math.PI / 2;
    pipe.scale.setScalar(1.7);
    pipe.position.set(0.05, 0.2, 0.45);
    root.add(pipe);
    // sanitary manifold: hot (red) and cold (blue) brass bars with a valve per appliance
    const man = new THREE.Group();
    const brass = M3(0xc9a24a, 0.3, 1);
    const sleeveHot = M3(0xd9443c, 0.85), sleeveCold = M3(0x2f6fd6, 0.85);
    [[0.95, M3(0xd8343a, 0.5), sleeveHot, -0.06, -0.3], [0.7, M3(0x2f6fd6, 0.5), sleeveCold, 0.1, -0.18]].forEach(([y, handle, sleeve, z, x0]) => {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.78, 32), brass);
      bar.rotation.z = Math.PI / 2; bar.position.set(0, y, z); bar.castShadow = true; man.add(bar);
      for (let i = 0; i < 3; i++) {
        const x = x0 + i * 0.24;
        const v = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.11, 24), brass);
        v.position.set(x, y - 0.08, z); man.add(v);
        const h = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.018, 0.03), handle);
        h.position.set(x + 0.04, y - 0.06, z + 0.045); man.add(h);
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, y - 0.05, 20), pex);
        tube.position.set(x, (y - 0.13) / 2, z); man.add(tube);
        const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, y - 0.3, 20), sleeve);
        sl.position.set(x, (y - 0.3) / 2 + 0.02, z); man.add(sl);
      }
      for (const sx of [-0.42, 0.42]) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.04, 6), brass);
        cap.rotation.z = Math.PI / 2; cap.position.set(sx, y, z); man.add(cap);
      }
    });
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.04), M3(0x2a2e33, 0.6));
    plate.position.set(0, 1.08, -0.05); man.add(plate);
    man.position.set(0, 0, -0.22);
    root.add(man);
    return root;
  }
  function buildStora() {
    const root = new THREE.Group();
    const cutStart = 1.38, cutLen = Math.PI * 1.5, H = 1.8;
    root.add(shell(0.34, 0.36, 0.06, H, M3(0xc6cbd1, 0.35, 0.6), cutStart, cutLen));
    root.add(shell(0.30, 0.34, 0.06, H, M3(0xe9d28a, 0.95), cutStart, cutLen));
    root.add(shell(0.29, 0.30, 0.06, H, M3(0x5d7f9e, 0.35, 0.1), cutStart, cutLen));
    // top cap (dome) and base
    const dome = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.36, 0), new THREE.Vector2(0.33, 0.06), new THREE.Vector2(0.2, 0.12), new THREE.Vector2(0, 0.14)], 72, cutStart, cutLen), M3(0x23272c, 0.5));
    dome.position.y = H; root.add(dome);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 72, 1, false, cutStart, cutLen), M3(0x23272c, 0.6));
    base.position.y = 0.03; root.add(base);
    // two coils: solar (lower) and heat pump (upper)
    function helix(y0, turns, pitch, color, glow) {
      const pts = [];
      for (let i = 0; i <= turns * 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.sin(a) * 0.2, y0 + (i / 48) * pitch, Math.cos(a) * 0.2));
      }
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), turns * 64, 0.022, 10), M3(color, 0.35, 0.8, { emissive: glow, emissiveIntensity: 0.25 }));
      m.castShadow = true;
      return m;
    }
    root.add(helix(0.22, 6, 0.065, 0xb8743f, 0xff7a2f));
    root.add(helix(1.0, 4, 0.06, 0x9a3b2f, 0xff3b2f));
    // connections at the back, anode, inspection flange
    for (const y of [0.25, 0.62, 1.03, 1.27]) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.24, 16), M3(0x9aa1a8, 0.3, 0.9));
      c.rotation.x = Math.PI / 2; c.position.set(0, y, -0.4); root.add(c);
    }
    const anode = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.3, 12), M3(0x8f969d, 0.5, 0.6));
    anode.position.y = H - 0.6; root.add(anode);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const f = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.06, 12), M3(0x23272c, 0.6));
      f.position.set(Math.sin(a) * 0.26, 0.0, Math.cos(a) * 0.26); root.add(f);
    }
    return root;
  }

  const DEF = {
    awf1: { file: 'bosch-compress-2000-awf-1v.glb', size: 1.12, dim: 'x', rotY: 0, fans: [[0.315, 0.5, 0.36]] },
    awf2: { file: 'bosch-compress-2000-awf-2v.glb', size: 1.62, dim: 'y', rotY: -Math.PI / 2, fans: [[0.39, 0.72, 0.19], [0.39, 0.29, 0.19]] },
    cs5800: { file: 'bosch-compress-5800i-aw.glb', size: 1.25, dim: 'x', rotY: 0 },
    tss300: { file: 'bosch-termossifao-f2-300.glb', size: 2.35, dim: 'x', rotY: -Math.PI / 2 },
    vario: { file: 'uponor-vario.glb', size: 0.82, dim: 'y', rotY: 0 },
    multicamada: { build: buildMulticamada, size: 1.6, dim: 'x', rotY: 0, proc: true },
    stora: { build: buildStora, size: 1.85, dim: 'y', rotY: 0, proc: true },
  };
  function load(id) {
    if (cache[id]) return cache[id];
    const d = DEF[id];
    if (d.build) { cache[id] = Promise.resolve(fit(d.build(), d)); return cache[id]; }
    cache[id] = new Promise((res) => loader.load(MODELS + d.file, (g) => {
      g.scene.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        const m = o.material;
        if (m) { if (m.emissive) m.emissive.set(0); m.emissiveMap = null; m.needsUpdate = true; }
      });
      const u = fit(g.scene, d);
      if (d.fans) {
        const bx = u.userData.box, W = bx.max.x - bx.min.x, H = bx.max.y - bx.min.y;
        for (const [fx, fy, fr] of d.fans) {
          const f = fanOverlay(H * fr);
          f.position.set(bx.min.x + W * fx, bx.min.y + H * fy, bx.max.z + 0.004);
          u.add(f);
        }
      }
      res(u);
    }, undefined, () => res(null)));
    return cache[id];
  }

  async function openFor(sysId) {
    const id = modelFor(sysId);
    if (!id || !DEF[id]) return;
    if (!renderer) setup();
    const sys = DATA.systems[sysId];
    const v = currentVariant(sysId);
    titleEl.textContent = sys.modelLabel || (v && v.label) || sys.title;
    wrap.querySelector('.eq-3d__note').textContent = DEF[id].proc ? UI.note3dProc : UI.note3d;
    brandEl.textContent = sys.brand;
    wrap.hidden = false;
    requestAnimationFrame(() => wrap.classList.add('is-open'));
    open = true;
    resize();
    titleEl.focus({ preventScroll: true });
    loadingEl.hidden = false;
    const u = await load(id);
    loadingEl.hidden = true;
    holder.clear();
    if (!u) return;
    holder.add(u);
    const bx = u.userData.box, size = bx.getSize(new THREE.Vector3());
    const r = size.length() / 2;
    ground.scale.setScalar(Math.max(0.6, r));
    controls.target.set(0, size.y * 0.48, 0);
    const dist = r / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * (isSmall() ? 1.25 : 1.05);
    camera.position.set(dist * 0.55, size.y * 0.6 + dist * 0.18, dist * 0.82);
    controls.minDistance = r * 1.1;
    controls.maxDistance = dist * 1.8;
    controls.autoRotate = !reduceMotion;
    controls.update();
    track('equipamento_3d_modelo3d', id);
  }
  function close() {
    open = false;
    wrap.classList.remove('is-open');
    setTimeout(() => { if (!open) wrap.hidden = true; }, 250);
    if (state.lastTrigger && document.contains(state.lastTrigger)) state.lastTrigger.focus({ preventScroll: true });
  }
  wrap.querySelector('.eq-3d__close').addEventListener('click', close);

  return {
    open: openFor,
    close,
    isOpen: () => open,
    tick(dt) {
      if (!open || !renderer) return;
      for (const f of fans) f.rotation.z -= dt * (reduceMotion ? 0 : 6);
      controls.update();
      renderer.render(scene, camera);
    },
  };
}
