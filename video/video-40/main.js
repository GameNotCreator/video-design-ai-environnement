// page contract (render(t), DUR, READY, EV, TEXTS) for the lemo-opuscar render tools; the film is scene.js + story.js
import * as THREE from 'three';
import { makePost } from './post_ts.js';
import * as ST from './story.js';
import { build } from './scene.js';
import { drawOverlay, overlayReady, texts } from './ui.js';
import { setScrollTime } from './people.js';
const { DUR, T, shotAt, LINES } = ST;

const W = innerWidth || 1080, H = innerHeight || 1920, Q = new URLSearchParams(location.search);
const SS = +(Q.get('ss') ?? 2);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = H + 'px';
const ov = document.getElementById('ov'); ov.width = 1080; ov.height = 1920; ov.style.width = W + 'px'; ov.style.height = H + 'px';
const g = ov.getContext('2d');

const camera = new THREE.PerspectiveCamera(40, W / H, .05, 400);
const room = build();
const post = makePost(renderer, room.scene, camera, W, H, { ssaa: SS });
post.bloom.radius = .75;
const V = post.vig.uniforms; V.warm.value = .08; V.contrast.value = .22; V.sat.value = 1.05;
await overlayReady();

window.DUR = DUR;
window.render = t => {
  setScrollTime(t);
  const shot = shotAt(t);
  if (shot.id !== 'black' && shot.id !== 'card') {
    V.fade.value = 1; V.sat.value = 1.05; V.contrast.value = .22; V.amt.value = .62; post.dof.tiltAmt = 0;
    room.update(t, shot, camera, post, renderer, V);
    post.composer.render();
  } else { renderer.setRenderTarget(null); renderer.setClearColor('#000'); renderer.clear(); }
  drawOverlay(g, t);
};
window.TEXTS = texts;

// sound events for mix.py
const EV = LINES.map(L => ({ t: L.a, type: 'chime', who: L.who }));
(ST.COUNTER || []).forEach(([a], i) => { if (i > 0 && a < (ST.CNT?.end ?? T.txt)) EV.push({ t: a, type: 'tick' }); });
(ST.EVENTS || []).forEach(e => EV.push(e));
EV.push({ t: T.txt, type: 'card' }, { t: T.logo, type: 'end' }); if (ST.TXT2) EV.push({ t: T.txt2, type: 'card' });
window.EV = EV.sort((a, b) => a.t - b.t);
window.render(0);
window.READY = true;
