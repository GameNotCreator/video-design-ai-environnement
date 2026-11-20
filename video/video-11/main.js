// video-11 "She said yes": page contract (render(t), DUR, READY, EV, TEXTS) for the lemo-opuscar render tools
import * as THREE from 'three';
import { makePost } from './post_ts.js';
import { DUR, T, shotAt, LINES } from './story.js';
import { buildRestaurant } from './restaurant.js';
import { drawOverlay, overlayReady, texts } from './ui.js';
import { setScrollTime } from './people.js';

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
const room = buildRestaurant();
const post = makePost(renderer, room.scene, camera, W, H, { ssaa: SS });
post.bloom.radius = .75;
const V = post.vig.uniforms; V.warm.value = .08; V.contrast.value = .22; V.sat.value = 1.05;
await overlayReady();

const _v = new THREE.Vector3();
function tiltCenter() {
  const h = room.hero.root; camera.updateMatrixWorld(); h.updateMatrixWorld(); h.getWorldPosition(_v); _v.y += .6; _v.project(camera);
  return Math.min(.8, Math.max(.2, _v.y * .5 + .5));
}
window.DUR = DUR;
window.render = t => {
  setScrollTime(t);
  const shot = shotAt(t);
  if (shot.id === 'dinner') {
    V.fade.value = 1; V.sat.value = 1.05; V.contrast.value = .22; V.amt.value = .62;
    room.update(t, shot, camera, post, renderer);
    if (!Q.has('notilt') && t >= T.waiter && t < T.bill) { post.dof.tiltAmt = 14; post.dof.tiltC = tiltCenter(); post.dof.tiltW = .1; post.dof.tiltF = .3; post.dof.maxCoc = Math.max(post.dof.maxCoc, 20); V.sat.value *= 1.12; V.contrast.value = .28; }
    post.composer.render();
  } else { renderer.setRenderTarget(null); renderer.setClearColor('#000'); renderer.clear(); }
  drawOverlay(g, t);
};
window.TEXTS = texts;

// sound events for mix.py
const EV = LINES.map(L => ({ t: L.a, type: 'chime', who: L.who }));
EV.push({ t: 11.2, type: 'applause' }, { t: T.bill, type: 'bill' }, { t: T.lookUp, type: 'look' }, { t: T.txt2, type: 'card' }, { t: T.txt, type: 'card' }, { t: T.logo, type: 'end' });
window.EV = EV.sort((a, b) => a.t - b.t);
window.render(0);
window.READY = true;
