/* Home hero: every invitation template stands as a 3D card in one diagonal row; cards near the pointer rise on springs.
 * Covers are drawn at runtime from each template's own palette, photo and name, so the row always matches the catalogue.
 * Bundled to frontend/public/vendor/hero-shelf.js by scripts/build-motion.mjs. */
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const host = document.querySelector('[data-hero-shelf]');
const templates = window.INVITARA_availableTemplates ? window.INVITARA_availableTemplates() : [];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const OCCASIONS = {'save-date': 'Save the date', baby: 'Baby shower', bridal: 'Bridal shower', other: 'Celebration', 'brand-launch': 'Brand launch', 'store-opening': 'Store opening', 'product-launch': 'Product launch', 'restaurant-opening': 'Restaurant opening', 'property-launch': 'Property launch'};
const occasionLabel = key => OCCASIONS[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
const SERIF = '"Libre Caslon Display", Georgia, serif';
const SANS = '"Inter Tight", system-ui, sans-serif';

function rgb(hex) { const n = parseInt(String(hex).replace('#', '').slice(0, 6), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function luminance(hex) { const c = rgb(hex).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
function rgba(hex, alpha) { return 'rgba(' + rgb(hex).join(',') + ',' + alpha + ')'; }
function loadImage(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image(); img.decoding = 'async';
    img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src;
  });
}
function drawFit(g, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width || w, ih = img.naturalHeight || img.height || h, r = Math.max(w / iw, h / ih);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.drawImage(img, x + (w - iw * r) / 2, y + (h - ih * r) / 2, iw * r, ih * r); g.restore();
}
function wrap(g, text, maxWidth) {
  const lines = []; let line = '';
  for (const word of text.split(/\s+/)) { const next = line ? line + ' ' + word : word; if (g.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next; }
  return line ? lines.concat(line) : lines;
}

/* One invitation cover, 512 × 768 design units: dark palettes get a full-bleed photo, light ones a framed photo. */
function drawCover(t, img, scale) {
  const c = document.createElement('canvas'); c.width = 512 * scale; c.height = 768 * scale;
  const g = c.getContext('2d'); g.scale(scale, scale);
  const dark = luminance(t.bg) < .3, accent = Math.abs(luminance(t.gold) - luminance(t.bg)) < .12 ? t.ink : t.gold;
  g.fillStyle = t.bg; g.fillRect(0, 0, 512, 768);
  if (img && dark) {
    drawFit(g, img, 0, 0, 512, 768);
    const fade = g.createLinearGradient(0, 200, 0, 768);
    fade.addColorStop(0, rgba(t.bg, 0)); fade.addColorStop(.6, rgba(t.bg, .9)); fade.addColorStop(1, t.bg);
    g.fillStyle = fade; g.fillRect(0, 0, 512, 768);
  } else if (img) drawFit(g, img, 40, 40, 432, 420);
  g.fillStyle = accent; g.fillRect(40, 494, 44, 3);
  g.font = '500 17px ' + SANS; if ('letterSpacing' in g) g.letterSpacing = '3px';
  g.fillText(occasionLabel(t.occasion || t.event || '').toUpperCase(), 40, 536);
  if ('letterSpacing' in g) g.letterSpacing = '0px';
  g.fillStyle = t.ink;
  let size = 66, lines;
  do { g.font = '400 ' + size + 'px ' + SERIF; lines = wrap(g, t.name, 432); size -= 4; } while ((lines.length > 2 || lines.some(l => g.measureText(l).width > 432)) && size > 30);
  lines.forEach((line, i) => g.fillText(line, 40, 600 + i * (size + 6)));
  const names = [t.content?.basics?.nameA, t.content?.basics?.nameB].map(v => (v || '').trim()).filter(Boolean).join(' & ');
  if (names) { g.globalAlpha = .72; g.font = 'italic 400 22px ' + SERIF; g.fillText(names.length > 34 ? names.slice(0, 33) + '…' : names, 40, 728); g.globalAlpha = 1; }
  return c;
}
/* Paper edges: cream with fine brown lines, horizontal for the fore-edge and vertical for top and bottom. */
function pagesTexture(vertical) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = '#efe7d6'; g.fillRect(0, 0, 256, 256);
  for (let p = 0; p < 256; p += 2) { g.fillStyle = 'rgba(90,60,40,' + (.05 + Math.random() * .12).toFixed(3) + ')'; if (vertical) g.fillRect(p, 0, 1, 256); else g.fillRect(0, p, 256, 1); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}
function webglAvailable() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }

async function start() {
  await Promise.all([document.fonts.load('400 64px "Libre Caslon Display"'), document.fonts.load('500 17px "Inter Tight"')]).catch(() => {});
  const canvas = document.createElement('canvas'); canvas.className = 'hs-canvas'; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: 'high-performance'}); } catch { return; }
  host.append(canvas); host.classList.add('has-shelf');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene(), pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .55;
  const key = new THREE.DirectionalLight(0xfff3e4, 2.4); key.position.set(-4, 6, 6);
  const rim = new THREE.DirectionalLight(0xbfd2ff, 1.1); rim.position.set(6, 3, -4);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, .12));
  const camera = new THREE.PerspectiveCamera(19.5, 1, .1, 100), look = new THREE.Vector3(-1.4, -.15, -.6);
  camera.position.set(3.6, 2.15, 7.4); camera.lookAt(look);

  const geometry = new THREE.BoxGeometry(1, 1.5, .2);
  const edgeH = new THREE.MeshStandardMaterial({map: pagesTexture(false), roughness: .9});
  const edgeV = new THREE.MeshStandardMaterial({map: pagesTexture(true), roughness: .9});
  const anisotropy = renderer.capabilities.getMaxAnisotropy(), scale = coarse ? .62 : .75;
  const n = templates.length, disposables = [geometry, edgeH, edgeV, pmrem];
  const books = templates.map((t, i) => {
    const spine = new THREE.Color(t.bg).multiplyScalar(.62);
    const cover = new THREE.MeshPhysicalMaterial({color: t.bg, roughness: .42, clearcoat: .55, clearcoatRoughness: .35});
    const side = new THREE.MeshPhysicalMaterial({color: spine, roughness: .55, clearcoat: .3});
    const back = new THREE.MeshStandardMaterial({color: spine, roughness: .6});
    disposables.push(cover, side, back);
    const mesh = new THREE.Mesh(geometry, [edgeH, side, edgeV, edgeV, cover, back]);
    const group = new THREE.Group(); group.position.set(1.55 - .5 * i, -1.12, .9 - .2 * i); group.rotation.y = .32;
    group.add(mesh); scene.add(group);
    mesh.userData.index = i;
    loadImage(t.content?.sections?.hero?.photo).then(img => {
      const tex = new THREE.CanvasTexture(drawCover(t, img, scale));
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = anisotropy;
      cover.map = tex; cover.color.set(0xffffff); cover.needsUpdate = true; disposables.push(tex); dirty = true;
    });
    return {t, mesh, y: reduced ? 0 : -3, vy: 0, z: 0, vz: 0};
  });

  /* Pointer state: the wave follows the real pointer; after 4s idle (or on touch) a virtual cursor sweeps the row unless paused. */
  const caption = host.querySelector('.hs-caption'), toggle = host.querySelector('.hs-motion');
  const pointer = {x: 0, y: 0, active: false, moved: -1e9}, ndc = new THREE.Vector2(), ray = new THREE.Raycaster(), v = new THREE.Vector3();
  let width = 1, height = 1, hovered = -1, paused = false, running = false, dirty = true, frame = 0, last = performance.now(), clock = 0;
  const meshes = books.map(b => b.mesh);
  function project(mesh) { v.set(0, .1, 0); mesh.localToWorld(v); v.project(camera); return [(v.x + 1) / 2 * width, (1 - v.y) / 2 * height]; }
  function setHover(index) {
    if (index === hovered) return; hovered = index; canvas.style.cursor = index < 0 ? '' : 'pointer';
    if (caption) { caption.hidden = index < 0; if (index >= 0) { const t = books[index].t; caption.textContent = t.name + ' · ' + occasionLabel(t.occasion || '') + ' — click to preview'; } }
  }
  function pick() {
    if (!pointer.active) return setHover(-1);
    ndc.set(pointer.x / width * 2 - 1, -(pointer.y / height) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false)[0]; setHover(hit ? hit.object.userData.index : -1);
  }
  function onMove(e) { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = e.pointerType !== 'touch'; pointer.moved = performance.now(); pick(); dirty = true; }
  function onLeave() { pointer.active = false; setHover(-1); dirty = true; }
  function onClick() {
    if (hovered < 0) return;
    const id = books[hovered].t.id;
    if (window.INVITARA_openPremium) window.INVITARA_openPremium(id); else location.href = 'create.html#preview=' + encodeURIComponent(id);
  }
  host.addEventListener('pointermove', onMove); host.addEventListener('pointerleave', onLeave); canvas.addEventListener('click', onClick);
  addEventListener('blur', onLeave);
  if (toggle && !reduced) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => { paused = !paused; toggle.setAttribute('aria-pressed', String(paused)); toggle.textContent = paused ? 'Play motion' : 'Pause motion'; });
  }

  function resize() {
    width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.fov = width < height ? 40 : 19.5;
    camera.updateProjectionMatrix(); dirty = true; if (!running) renderer.render(scene, camera);
  }
  const K = 70, C = 12.5;
  function tick(now) {
    frame = 0; const dt = Math.min((now - last) / 1000, .05); last = now; clock += dt;
    let target = null;
    if (pointer.active && now - pointer.moved < 4000 && !coarse) target = [pointer.x, pointer.y];
    else if (!reduced && !paused && clock > 2) {
      const u = (Math.sin(clock * .45) + 1) / 2, a = project(books[Math.max(0, n - 3)].mesh), b = project(books[Math.min(1, n - 1)].mesh);
      target = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    }
    const s = Math.max(innerWidth, innerHeight) * .085;
    let moving = false;
    books.forEach((book, i) => {
      let lift = 0;
      if (target && !reduced) { const [sx, sy] = project(book.mesh); lift = .78 * Math.exp(-((sx - target[0]) ** 2 + ((sy - target[1]) * .55) ** 2) / (s * s)); }
      const goal = reduced || clock > .25 + (n - i) * .035 ? lift : -3, goalZ = Math.max(0, goal) * .35;
      for (let k = 0, h = dt / 4; k < 4; k++) {
        book.vy += ((goal - book.y) * K - book.vy * C) * h; book.y += book.vy * h;
        book.vz += ((goalZ - book.z) * K - book.vz * C) * h; book.z += book.vz * h;
      }
      book.mesh.position.set(0, book.y, book.z); book.mesh.rotation.x = -book.vy * .012;
      if (Math.abs(book.vy) > 1e-3 || Math.abs(goal - book.y) > 1e-3) moving = true;
    });
    if (moving || dirty || target) renderer.render(scene, camera);
    dirty = false;
    if (running) frame = requestAnimationFrame(tick);
  }
  function setRunning(on) {
    if (on === running) return; running = on;
    if (on) { last = performance.now(); frame = requestAnimationFrame(tick); } else cancelAnimationFrame(frame);
  }
  let visible = true;
  const io = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; setRunning(visible && !document.hidden); });
  io.observe(host);
  const onVisibility = () => setRunning(visible && !document.hidden);
  document.addEventListener('visibilitychange', onVisibility);
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  addEventListener('pagehide', () => {
    setRunning(false); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVisibility);
    disposables.forEach(d => d.dispose()); renderer.dispose();
  }, {once: true});
}

if (host && templates.length && webglAvailable()) start();
