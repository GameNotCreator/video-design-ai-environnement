// "Fais un vœu": his birthday. Lights down, a cake with five candles, four friends in party hats singing round the
// table; he sits at the head of it, scrolling (party hat on). The candles burn down, flare, the cake catches fire, smoke,
// the alarm blinks; his friends get up and leave one by one. He is alone with a black cake when he looks up.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { particles } from './fx.js';
import { makePerson, WALK, walkFrame, SPX } from './people.js';
import { T, FRIENDS_UP, LEAVE } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex() { const P = new PX(64, 64), R = ramp(['#3a2e2a', '#4a3c36', '#5a4a42', '#6a5a50'], .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, 5) - .5) * .22 + (h2(x, y, 5) - .5) * .1, x, y)); return P.done(); }
function clothTex() { const P = new PX(40, 48), R = ramp(['#8a8478', '#b0a898', '#cfc6b4', '#e6dece'], .45); P.fill((x, y) => R(.6 + (((x >> 2) + (y >> 2)) % 2) * .12 + (h2(x, y, 3) - .5) * .12, x, y)); return P.done(); }
function stripeTex(c) { const P = new PX(8, 16), A = hex(c), W = [236, 232, 224]; P.fill((x, y) => (((y + x) >> 2) % 2) ? A : W); return texOf(P.done()); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#06060a');
  scene.add(mesh(new THREE.BoxGeometry(7, .2, 6).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 5, cols: ['#2a1c14', '#40291c', '#583a26', '#704c32', '#8a603e'] }))));
  const wM = mat(wallTex()); const back = box(7, 3, .2, wM); back.position.set(0, 0, -2.2); scene.add(back);
  const left = box(.2, 3, 6, wM); left.position.set(-2.2, 0, 0); scene.add(left);
  // garland of little flags across the back wall, two balloons
  const flagCols = ['#d8b860', '#6aa0b8', '#c890a8', '#8ab070', '#e0d0b0'];
  for (let i = 0; i < 15; i++) {
    const x = -1.75 + i * .25, y = 2.15 - Math.sin(i / 14 * Math.PI) * .25;
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.09, 0, 0), new THREE.Vector3(.09, 0, 0), new THREE.Vector3(0, -.17, 0)]); g.computeVertexNormals();
    const f = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: flagCols[i % 5], roughness: .9, side: THREE.DoubleSide })); f.position.set(x, y, -2.08); scene.add(f);
  }
  [[-1.55, 1.55, '#a888c0'], [1.5, 1.7, '#d8b860']].forEach(([x, y, c]) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(.17, 14, 12), new THREE.MeshStandardMaterial({ color: c, roughness: .35 })); b.scale.y = 1.15; b.position.set(x, y, -1.9); scene.add(b);
    const s = new THREE.Mesh(new THREE.BoxGeometry(.008, .9, .008), new THREE.MeshBasicMaterial({ color: '#d0c8b8' })); s.position.set(x, y - .62, -1.9); scene.add(s);
  });
  // smoke alarm on the back wall: white disc, a red LED that blinks once the smoke rises
  const alarm = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .04, 18), new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: .6 })); alarm.rotation.x = Math.PI / 2; alarm.position.set(.55, 2.45, -2.08); scene.add(alarm);
  const led = glow('#ff3020', .12, 1.2); led.position.set(.55, 2.45, -2.04); scene.add(led);
  const ledL = new THREE.PointLight('#ff4030', 0, 3, 1.5); ledL.position.set(.55, 2.3, -1.8); scene.add(ledL);
  // the table (head of the table at the back: his seat), cloth, chairs
  const woodM = new THREE.MeshStandardMaterial({ color: '#5a3c26', roughness: .7 });
  const top = box(.86, .05, 1.3, mat(clothTex())); top.position.set(0, .7, -.75); scene.add(top);
  for (const [x, z] of [[-.38, -1.35], [.38, -1.35], [-.38, -.15], [.38, -.15]]) { const l = box(.05, .7, .05, woodM); l.position.set(x, 0, z); scene.add(l); }
  const chairs = [[0, -1.55], [-.66, -1.05], [-.66, -.45], [.66, -1.05], [.66, -.45]].map(([x, z]) => { const c = new THREE.Group(); const s = box(.4, .05, .4, woodM); s.position.y = .42; c.add(s); const bk = box(.4, .5, .05, woodM); bk.position.set(0, .45, x === 0 ? -.2 : (x < 0 ? -.2 : -.2)); c.add(bk); c.position.set(x, 0, z); if (x !== 0) c.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(c); return c; });
  // plates and glasses
  for (const [x, z] of [[-.25, -1.05], [-.25, -.45], [.25, -1.05], [.25, -.45], [0, -1.25]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.09, .08, .015, 16), new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: .4 })); p.position.set(x, .735, z); scene.add(p); }
  // the cake: sponge, icing (turns to charcoal), five candles that burn down
  const cakeM = new THREE.MeshStandardMaterial({ color: '#c89060', roughness: .8 }), icingM = new THREE.MeshStandardMaterial({ color: '#f0c8cc', roughness: .5 });
  const cake = new THREE.Group(); cake.position.set(0, .725, -.75); scene.add(cake);
  const sponge = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .12, 24), cakeM); sponge.position.y = .06; cake.add(sponge);
  const icing = new THREE.Mesh(new THREE.CylinderGeometry(.175, .175, .03, 24), icingM); icing.position.y = .13; cake.add(icing);
  const candleM = [stripeTex('#6aa0b8'), stripeTex('#d8b860'), stripeTex('#c890a8'), stripeTex('#8ab070'), stripeTex('#a888c0')].map(m => new THREE.MeshStandardMaterial({ map: m, roughness: .6 }));
  const candles = [0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2 + .3, c = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, 1, 8).translate(0, .5, 0), candleM[i]); c.position.set(Math.cos(a) * .1, .145, Math.sin(a) * .1); cake.add(c); return c; });
  const flames = candles.map(() => { const f = glow('#ffc060', .08, 1.4); scene.add(f); return f; });
  const fires = Array.from({ length: 4 }, () => { const f = glow('#ff6a20', .2, .7); scene.add(f); return f; });
  // flames licking up from the icing: additive particles, yellow at the base, red at the tips
  const flameP = particles(160, (i, t, o) => {
    const per = .55 + h2(i, 4, 3) * .35, ph = (t / per + h2(i, 1, 3)) % 1, a = h2(i, 2, 3) * Math.PI * 2, r = Math.sqrt(h2(i, 3, 3)) * .15;
    const f = ss(seg(t, T.fire, T.fire + .6)) * (1 - ss(seg(t, T.fireOut, T.burnt)));
    o.x = Math.cos(a) * r * (1 - ph * .6) + Math.sin(t * 6 + i) * .01; o.y = .87 + ph * (.26 + .16 * h2(i, 5, 3)); o.z = -.75 + Math.sin(a) * r * (1 - ph * .6);
    o.a = f * (1 - ph) * .9; o.s = (.07 + .05 * h2(i, 6, 3)) * (1 - ph * .5); o.r = 1; o.g = .75 - ph * .55; o.b = .25 - ph * .2;
  }, { soft: 1 });
  scene.add(flameP);
  const candleL = new THREE.PointLight('#ffb060', 1.2, 3.2, 1.6); candleL.position.set(0, 1.05, -.7); scene.add(candleL);
  // smoke from the cake once it burns
  const smoke = particles(220, (i, t, o) => {
    const born = T.smoke + h2(i, 1, 7) * 5.5, life = (t - born) / 4.0, r = h2(i, 2, 7), q = h2(i, 3, 7);
    if (life < 0 || life > 1) { o.a = 0; o.x = 0; o.y = -5; o.z = 0; return; }
    o.x = (r - .5) * .1 + Math.sin(t * .8 + i) * .12 * life + (r - .5) * .9 * life; o.y = .9 + life * 1.7 + q * .1; o.z = -.75 + (q - .5) * .5 * life;
    o.a = .42 * Math.sin(Math.PI * life) * (1 - .6 * ss(seg(t, T.burnt + 1.5, T.txt))); o.s = .35 + life * 1.1; const g = .22 + q * .1; o.r = g; o.g = g; o.b = g * 1.05;
  }, { blend: THREE.NormalBlending, soft: 1 });
  scene.add(smoke);
  // lights: lights down for the cake (warm), a low fill so faces read
  const hemi = new THREE.HemisphereLight('#c8b8b0', '#2a1c14', 1.1); scene.add(hemi);
  const fill = new THREE.PointLight('#e8e0f0', 1.8, 7, 1.5); fill.position.set(.4, 1.9, 2.0); scene.add(fill);
  const lampL = new THREE.PointLight('#ffcf90', 1.6, 5, 1.5); lampL.position.set(-1.6, 1.9, -1.0); scene.add(lampL);
  const phoneL = new THREE.PointLight('#8fc0ff', .9, 1.3, 2); scene.add(phoneL);

  // party hats: little striped 3D cones set on each head (sprites have no room above the head)
  const hatTex = ['#6aa0b8', '#d8b860', '#c890a8', '#8ab070', '#c41919'].map(c => stripeTex(c));
  function hat(i) { const m = new THREE.Mesh(new THREE.ConeGeometry(.075, .24, 12).translate(0, .12, 0), new THREE.MeshStandardMaterial({ map: hatTex[i], roughness: .7 })); const pom = glow('#fff6e8', .06, .6); pom.position.y = .25; m.add(pom); return m; }
  // him (birthday boy, red hat) at the head of the table
  const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } });
  hero.root.position.set(0, .02, -1.5); hero.shadow.visible = false; scene.add(hero.root);
  const heroHat = hat(4); hero.root.add(heroHat);
  // friends: Léa and Hugo nearest the cake on the right, two more on the left
  const FF = { sit: { pose: 'sit', smile: 1 }, sing: { pose: 'sittalk', mouth: 1, smile: 1 }, talk: { pose: 'sittalk', mouth: 1 }, still: { pose: 'sit' }, stand: { pose: 'stand' }, ...WALK };
  const friends = [
    { p: makePerson({ top: 'teal', bottom: 'jean', hair: 'hairBlond', shoe: 'sneaker' }, FF), seat: [-.48, -1.1], flip: false, hat: 0 },
    { p: makePerson({ top: 'mustard', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', shoe: 'shoe' }, FF), seat: [-.6, -.36], flip: false, hat: 1 },
    { p: makePerson({ top: 'purple', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', hairUp: 1, shoe: 'shoe' }, FF), seat: [.48, -1.1], flip: true, hat: 2, name: 'lea' },
    { p: makePerson({ top: 'green', bottom: 'grey', hair: 'hairDark', beard: 1, shoe: 'sneaker' }, FF), seat: [.6, -.36], flip: true, hat: 3, name: 'hugo' },
  ];
  friends.forEach(f => { f.p.shadow.visible = false; scene.add(f.p.root); f.hat = hat(f.hat); f.p.root.add(f.hat); });
  // the hat sits on the head: sprite head centre (hx, hy) → local offset, mirrored when the sprite is flipped
  const setHat = (h, flip, hx, hy, tilt) => { h.position.set((hx - 17) * SPX * (flip ? -1 : 1), (50 - hy + 4.2) * SPX, .02); h.rotation.z = (flip ? 1 : -1) * tilt; };
  const _v = new THREE.Vector3();
  const CAM = [
    [0, [0, 2.3, 3.0], [0, .78, -.85], 46], [9.0, [.04, 2.22, 2.8], [0, .8, -.85], 46],
    [14.0, [.04, 2.1, 2.6], [0, .85, -1.0], 46], [16.4, [0, 1.2, .7], [0, .98, -1.4], 48],
  ];
  function camAt(t) { let i = 0; while (i < CAM.length - 1 && t >= CAM[i + 1][0]) i++; const A = CAM[i], B = CAM[Math.min(i + 1, CAM.length - 1)]; const u = i === CAM.length - 1 ? 0 : eio(seg(t, A[0], B[0])); return [0, 1, 2].map(k => A[1][k] + (B[1][k] - A[1][k]) * u).concat([0, 1, 2].map(k => A[2][k] + (B[2][k] - A[2][k]) * u), A[3] + (B[3] - A[3]) * u); }

  function update(t, shot, cam, post, renderer) {
    const c = camAt(t); cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); cam.fov = c[6]; cam.updateProjectionMatrix();
    // candles burn down, flare on the drop, then the icing burns
    const melt = seg(t, T.melt, T.flare), h = lerp(.11, .02, eio(melt));
    const flare = ss(seg(t, T.flare, T.flare + .3)), fire = ss(seg(t, T.fire, T.fire + .6)) * (1 - ss(seg(t, T.fireOut, T.burnt)));
    candles.forEach((cd, i) => { cd.scale.y = h; cd.getWorldPosition(_v); flames[i].position.set(_v.x, _v.y + h + .025 + flare * .03, _v.z); const fl = .85 + .15 * Math.sin(t * 17 + i * 2.3) * Math.sin(t * 5.1 + i); flames[i].scale.setScalar((.075 + flare * .12) * fl); flames[i].visible = t < T.fireOut + .5; flames[i].material.opacity = 1 - ss(seg(t, T.fireOut, T.fireOut + .5)); });
    flameP.visible = t >= T.fire && t < T.burnt; flameP.userData.update(t);
    fires.forEach((f, i) => { const a = i / 4 * Math.PI * 2, r = .05 + h2(i, 1, 4) * .1, fl = .7 + .3 * Math.sin(t * (9 + i) + i); f.position.set(Math.cos(a) * r, .725 + .17 + fl * .06 * fire, -.75 + Math.sin(a) * r); f.scale.setScalar((.12 + h2(i, 2, 4) * .12) * fire * fl); f.visible = fire > .01; });
    const burnt = ss(seg(t, T.fire, T.burnt)); icingM.color.set('#f0c8cc').lerp(new THREE.Color('#1e1816'), burnt); cakeM.color.set('#c89060').lerp(new THREE.Color('#2a1e18'), burnt * .8);
    candleL.intensity = (1.2 + flare * .7 + fire * 1.6) * (t < T.fireOut ? 1 : 1 - .75 * ss(seg(t, T.fireOut, T.burnt))) * (.92 + .08 * Math.sin(t * 13));
    smoke.visible = t >= T.smoke; smoke.userData.update(t);
    const blink = t >= T.alarm && Math.floor((t - T.alarm) * 2.5) % 2 === 0; led.visible = t >= T.alarm ? blink : false; ledL.intensity = blink ? 1.6 : 0;
    // him
    hero.frame(t >= T.up ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); hero.face(cam);
    setHat(heroHat, false, t >= T.up ? 17 : 18, t >= T.up ? 9 : 10, t >= T.up ? .05 : .25);
    phoneL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t >= T.up ? .25 : .9;
    // friends: sing, react, stand up, walk out to the right one by one
    friends.forEach((f, i) => {
      const [sx, sz] = f.seat, out = LEAVE[i], p = f.p;
      let x = sx, z = sz, fr, flip = f.flip, y = .02;
      if (t < 6.0) fr = Math.floor(t * 2.6 + i) % 2 ? 'sing' : 'sit';
      else if (t < FRIENDS_UP) fr = (f.name === 'lea' && t >= 6.1 && t < 8.9) || (f.name === 'hugo' && t >= 9.1) ? (Math.floor(t * 3) % 2 ? 'talk' : 'still') : 'still';
      else if (t < out) { fr = 'stand'; y = 0; x = sx + (sx < 0 ? -.12 : .12); }
      else { const k = seg(t, out, out + 1.1), sd = sx < 0 ? -1 : 1; y = 0; x = lerp(sx + sd * .12, sd * 1.9, k); z = lerp(sz, sz - .35, k); fr = walkFrame(t + i); flip = sd < 0; }
      p.root.visible = !(t >= out && Math.abs(x) > 1.8); p.root.position.set(x, y, z); p.frame(fr); p.face(cam, flip);
      const standing = t >= FRIENDS_UP; setHat(f.hat, flip, 17, 9, standing ? .08 : .15);
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, .9, t >= 14.0 ? -1.5 : -.9)); post.dof.aper = 10; post.dof.maxCoc = 8;
    renderer.toneMappingExposure = 1.15; post.bloom.strength = .3; post.bloom.threshold = .9;
  }
  return { scene, update };
}
