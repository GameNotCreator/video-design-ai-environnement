// video-12 "Can I cheat it? EP. 1": page contract (render(t), DUR, READY, EV, TEXTS) for the lemo-opuscar render tools
import * as THREE from 'three';
import { makePost } from './post_ts.js';
import { DUR, T, shotAt, LINES, TRIES } from './story.js';
import { buildRoom } from './room.js';
import { drawOverlay, overlayReady, texts } from './ui.js';

const W = innerWidth || 1080, H = innerHeight || 1920, Q = new URLSearchParams(location.search);
const SS = +(Q.get('ss') ?? 2);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = H + 'px';
const ov = document.getElementById('ov'); ov.width = 1080; ov.height = 1920; ov.style.width = W + 'px'; ov.style.height = H + 'px';
const g = ov.getContext('2d');

const camera = new THREE.PerspectiveCamera(40, W / H, .05, 400);
const room = buildRoom();
const post = makePost(renderer, room.scene, camera, W, H, { ssaa: SS });
post.bloom.radius = .7;
const V = post.vig.uniforms; V.warm.value = .06; V.contrast.value = .2; V.sat.value = 1.05;
await overlayReady();

const _v = new THREE.Vector3();
function tiltCenter() {
  const h = room.hero.root; camera.updateMatrixWorld(); h.updateMatrixWorld(); h.getWorldPosition(_v); _v.y += .7; _v.project(camera);
  return Math.min(.8, Math.max(.2, _v.y * .5 + .5));
}
window.DUR = DUR;
window.render = t => {
  const shot = shotAt(t);
  if (Q.has('textonly')) { drawOverlay(g, t); return; }   // readcheck: the texts only, no 3D
  if (shot.id === 'room') {
    V.fade.value = 1; V.amt.value = .6;
    const st = room.update(t, camera, post, renderer);
    post.dof.tiltAmt = 0;
    if (!Q.has('notilt') && st.wide) { post.dof.tiltAmt = 10; post.dof.tiltC = tiltCenter(); post.dof.tiltW = .12; post.dof.tiltF = .3; post.dof.maxCoc = Math.max(post.dof.maxCoc, 16); }
    post.composer.render();
  } else { renderer.setRenderTarget(null); renderer.setClearColor('#000'); renderer.clear(); }
  drawOverlay(g, t);
};
window.TEXTS = texts;

// sound events for mix.py (voice lines carry their start time v)
const EV = LINES.map(L => ({ t: L.v, type: 'voice', id: L.id })).concat(LINES.filter(L => !L.instant).map(L => ({ t: L.a, type: 'chime' })));
TRIES.forEach(R => EV.push({ t: R.a, type: 'try', n: R.n }, { t: R.fail, type: 'fail', n: R.n }));
EV.push({ t: T.press, type: 'press' }, { t: T.off, type: 'off' }, { t: T.boot, type: 'boot' }, { t: T.jiggle, type: 'jiggle' }, { t: T.poof, type: 'poof' }, { t: T.tapApp, type: 'tap' },
  { t: T.stand, type: 'stand' }, { t: T.stand + .45, type: 'toss' }, { t: T.lid, type: 'lid' }, { t: T.lid + .3, type: 'desk' }, { t: T.book, type: 'book' }, { t: T.lamp, type: 'lamp' },
  { t: T.txt, type: 'card' }, { t: T.txt2, type: 'card2' }, { t: T.card, type: 'end' });
for (let k = 0; k < 4; k++) EV.push({ t: T.stand + .15 + k * .15, type: 'step' });
window.EV = EV.sort((a, b) => a.t - b.t);
window.render(0);
window.READY = true;
