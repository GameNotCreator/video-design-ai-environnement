// video-1 "One more video": page contract (render(t), DUR, READY, EV, TEXTS) for the lemo-opuscar render tools
import * as THREE from 'three';
import { makePost } from './post_ts.js';
import { DUR, T, shotAt, HX, WALK_FPS } from './story.js';
import { buildStreet } from './street.js';
import { buildPhone } from './phone.js';
import { drawOverlay, overlayReady, texts } from './ui.js';

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

const camera = new THREE.PerspectiveCamera(40, W / H, .05, 600);
const sets = { street: buildStreet(), phone: buildPhone() };
const SET_OF = { walk: 'street', wide: 'street', car: 'street', phone: 'phone' };
const post = makePost(renderer, sets.street.scene, camera, W, H, { ssaa: SS });
post.bloom.radius = .75;
const V = post.vig.uniforms; V.warm.value = .08; V.contrast.value = .22; V.sat.value = 1.05;
await overlayReady();

const _v = new THREE.Vector3();
function tiltCenter(S) {
  const h = S.hero.root; camera.updateMatrixWorld(); h.updateMatrixWorld(); h.getWorldPosition(_v); _v.y += .8; _v.project(camera);
  return Math.min(.8, Math.max(.2, _v.y * .5 + .5));
}
window.DUR = DUR;
window.render = t => {
  const shot = shotAt(t), sid = SET_OF[shot.id];
  if (sid) {
    const S = sets[sid]; post.dof.scene = S.scene;
    V.fade.value = 1; V.sat.value = 1.05; V.contrast.value = .22; post.dof.tiltAmt = 0;
    S.update(t, shot, camera, post, renderer);
    if (sid === 'street' && !Q.has('notilt')) { post.dof.tiltAmt = 15; post.dof.tiltC = tiltCenter(S); post.dof.tiltW = .09; post.dof.tiltF = .3; post.dof.maxCoc = Math.max(post.dof.maxCoc, 22); V.sat.value *= 1.14; V.contrast.value = .28; }
    post.composer.render();
  } else { renderer.setRenderTarget(null); renderer.setClearColor('#000'); renderer.clear(); }
  drawOverlay(g, t);
};
window.TEXTS = texts;

// sound events for mix.py
const EV = [];
for (let k = 0; ; k++) { const t = k * 2 / WALK_FPS; if (t >= T.look) break; EV.push({ t, type: 'step', surf: HX(t) < -4.05 ? 'pave' : 'road' }); }
EV.push({ t: T.dlgIn, type: 'chime' }, { t: T.ping1, type: 'ping' }, { t: T.ping2, type: 'ping' }, { t: T.engine, type: 'engine' },
  { t: T.horn, type: 'horn' }, { t: T.screech, type: 'screech' }, { t: T.impact, type: 'impact' },
  { t: T.buzz1, type: 'buzz' }, { t: T.buzz2, type: 'buzz' }, { t: T.txt1, type: 'card' }, { t: T.txt2, type: 'card' }, { t: T.logo, type: 'end' });
window.EV = EV.sort((a, b) => a.t - b.t);
window.render(0);
window.READY = true;
