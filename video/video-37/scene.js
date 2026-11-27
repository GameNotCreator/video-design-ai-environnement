// "L'été": the cut-away house, two identical floors. The summer: upstairs he scrolls on the bed (sun, then the dark);
// downstairs he locks his phone, takes the guitar off the wall and learns it (chord sheets pile up on the wall). The
// back-to-school party: both floors become the same living room. Upstairs his friend takes the guitar and he films;
// downstairs he takes it and plays, she smiles, his friend claps. Same composition, the roles swapped.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson } from './people.js';
import { T, phaseAt } from './story.js';
import { seg, eio, lerp } from '/core/lib.js';

const FY = [2.25, 0];   // floor heights: [upstairs, downstairs]
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#3a1e18', '#5a3024', '#7a4a32', '#9a6a44'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2 + ((x + y) % 8 === 0 ? -.15 : 0), x, y)); return P.done(); }
function stoneTex() { const P = new PX(64, 32), R = ramp(['#1a1816', '#2a2622', '#3a342e', '#4a433a'], .45); P.fill((x, y) => { const row = y >> 3, off = (row % 2) * 6, edge = (y % 8 === 0) || ((x + off) % 12 === 0); return R(edge ? .15 : .5 + (h2(x >> 2, y >> 2, 3) - .5) * .4, x, y); }); return P.done(); }
function sheetTex(s) {   // a chord sheet: title line, chord boxes, lyrics
  const P = new PX(20, 28); P.fill((x, y) => (x === 0 || x === 19 || y === 0 || y === 27) ? [170, 166, 156] : [238, 234, 224]);
  for (let x = 3; x < 13; x++) P.set(x, 3, [40, 46, 80]);
  for (let b = 0; b < 3; b++) for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) if (i === 0 || i === 3 || j === 0 || j === 4 || h2(b + s, i * j, 7) > .8) P.set(3 + b * 5 + i, 6 + j, [60, 60, 80]);
  for (let y = 14; y < 26; y += 2) for (let x = 2; x < 18; x++) if (h2(x, y, 3 + s) > .3) P.set(x, y, [40, 46, 80]);
  return texOf(P.done());
}
function guitarTex() {   // the acoustic guitar leaning on the wall / the sofa (12 x 30 px)
  const P = new PX(12, 30), Gw = ramp(['#4a240e', '#86491c', '#c07a32', '#e8a854'], .22);
  P.ellipse(6, 23.5, 5.4, 5.2, (x, y, dx, dy) => Gw(.62 - dy * .2 - dx * .15, x, y));
  P.ellipse(6, 15.5, 4.0, 3.8, (x, y, dx, dy) => Gw(.7 - dy * .2 - dx * .15, x, y));
  P.ellipse(6, 18.5, 1.6, 1.6, () => hex('#1a0e08')); P.rect(4, 25, 5, 1, hex('#2a180e'));
  for (let y = 2; y < 13; y++) { P.set(5, y, hex('#3a2416')); P.set(6, y, hex('#2a180e')); if (y % 3 === 0) P.set(5, y, hex('#9a8a70')); }
  P.rect(4, 0, 4, 2, hex('#2a180e')); P.outline(.3); return texOf(P.done());
}
function sofaTex() { const P = new PX(48, 16), R = ramp(['#1c2a2a', '#2a3e3c', '#3c5654', '#527270'], .45); P.fill((x, y) => R(.5 + (h2(x >> 1, y >> 1, 5) - .5) * .25 - (x % 16 === 0 ? .2 : 0), x, y)); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
  const gTex = guitarTex();
  const guitarProp = () => new THREE.Mesh(new THREE.PlaneGeometry(12 / 30, 1.0), new THREE.MeshStandardMaterial({ map: gTex, transparent: true, alphaTest: .5, roughness: .7 }));
  const floors = FY.map((y0, f) => {
    const g = new THREE.Group(); g.position.y = y0; scene.add(g);
    g.add(mesh(new THREE.BoxGeometry(3.2, .02, 2.25).translate(0, .01, -1.1), mat(woodPlanks(96, 64, { pw: 6, len: 48, seed: 3 + f, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))));
    // —— his bedroom (the summer) ——
    const bed = new THREE.Group(); g.add(bed);
    const wM = mat(wallTex(['#4a3c34', '#5e4c40', '#74604e', '#8a745e'], 2 + f));
    const back = box(3.2, 2.0, .1, wM); back.position.set(0, 0, -2.25); bed.add(back);
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, wM); sw.position.set(x, 0, -1.1); bed.add(sw); }
    const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6 + f, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
    const bf = box(.95, .3, 1.9, woodM); bf.position.set(-1.05, 0, -1.2); bed.add(bf);
    const mt = box(.92, .14, 1.86, mat(blanketTex())); mt.position.set(-1.05, .3, -1.2); bed.add(mt);
    const pil = box(.7, .1, .35, new THREE.MeshStandardMaterial({ color: '#d8d0c4', roughness: 1 })); pil.position.set(-1.05, .44, -1.95); bed.add(pil);
    const skyM = new THREE.MeshBasicMaterial({ color: '#8cc4f0' }), win = new THREE.Mesh(new THREE.PlaneGeometry(.8, .6), skyM); win.position.set(-.1, 1.32, -2.19); bed.add(win);
    const frM = new THREE.MeshStandardMaterial({ color: '#e0d8c8', roughness: .9 });
    for (const [w, h, x, y] of [[.88, .05, -.1, 1.63], [.88, .05, -.1, 1.02], [.05, .66, -.52, 1.32], [.05, .66, .32, 1.32], [.03, .6, -.1, 1.32]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), frM); b.position.set(x, y, -2.18); bed.add(b); }
    const sun = glow('#fff0c0', .35, 1.0); sun.position.set(.12, 1.5, -2.18); bed.add(sun);
    const moon = glow('#c8d8ff', .2, 1.0); moon.position.set(.1, 1.5, -2.18); bed.add(moon);
    const desk = box(1.05, .05, .62, woodM); desk.position.set(1.05, .72, -1.05); bed.add(desk);
    for (const [x, z] of [[.6, -1.3], [1.5, -1.3], [.6, -.8], [1.5, -.8]]) { const l = box(.05, .72, .05, woodM); l.position.set(x, 0, z); bed.add(l); }
    const chair = box(.4, .05, .4, woodM); chair.position.set(.22, .42, -1.02); bed.add(chair);
    for (const [x, z] of [[.05, -1.19], [.39, -1.19], [.05, -.85], [.39, -.85]]) { const l = box(.04, .42, .04, woodM); l.position.set(x, 0, z); bed.add(l); }
    const lampB = box(.06, .32, .06, new THREE.MeshStandardMaterial({ color: '#202028' })); lampB.position.set(1.0, .745, -1.25); bed.add(lampB);
    const lampG = glow('#ffc070', .3, 1.0); lampG.position.set(.96, 1.1, -1.2); bed.add(lampG);
    const wallGuitar = guitarProp(); wallGuitar.position.set(1.38, 1.3, -2.17); wallGuitar.rotation.z = -.08; bed.add(wallGuitar);
    const sheets = [0, 1, 2].map(i => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.22, .3), new THREE.MeshStandardMaterial({ map: sheetTex(i), roughness: .95 })); p.position.set(.45 + i * .24, 1.5 - (i % 2) * .06, -2.185); p.rotation.z = (i - 1) * .06; p.visible = false; bed.add(p); return p; });
    const facedown = box(.08, .015, .15, new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .4 })); facedown.position.set(.68, .745, -.85); facedown.visible = false; bed.add(facedown);
    const sunL = new THREE.PointLight('#ffe2b0', 3.0, 3.4, 1.3); sunL.position.set(-.1, 1.4, -1.5); g.add(sunL);
    const lampL = new THREE.PointLight('#ffcf90', 0, 2.6, 1.5); lampL.position.set(.95, 1.2, -.9); g.add(lampL);
    const moonL = new THREE.PointLight('#8aa0e0', 0, 3, 1.5); moonL.position.set(-.1, 1.3, -1.6); g.add(moonL);
    // —— the party: a living room at night, string lights, a sofa, the guitar on the sofa arm ——
    const party = new THREE.Group(); party.visible = false; g.add(party);
    const pM = mat(wallTex(['#2a2030', '#382a3c', '#46364a', '#56445a'], 9 + f));
    const pb = box(3.2, 2.0, .1, pM); pb.position.set(0, 0, -2.25); party.add(pb);
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, pM); sw.position.set(x, 0, -1.1); party.add(sw); }
    const pwin = new THREE.Mesh(new THREE.PlaneGeometry(.7, .6), new THREE.MeshBasicMaterial({ color: '#0c1430' })); pwin.position.set(1.0, 1.3, -2.19); party.add(pwin);
    for (let i = 0; i < 11; i++) { const x = -1.45 + i * .29, y = 1.78 - Math.sin(i / 10 * Math.PI) * .12, c = ['#ffd890', '#ffb870', '#fff0c0'][i % 3]; const b = glow(c, .09, 1.0); b.position.set(x, y, -2.16); party.add(b); }
    const sM = mat(sofaTex());
    const seat = box(1.5, .38, .55, sM); seat.position.set(-.45, 0, -1.55); party.add(seat);
    const backr = box(1.5, .4, .14, sM); backr.position.set(-.45, .38, -1.8); party.add(backr);
    for (const x of [-1.25, .35]) { const a = box(.12, .56, .55, sM); a.position.set(x, 0, -1.55); party.add(a); }
    const sofaGuitar = guitarProp(); sofaGuitar.position.set(.52, .5, -1.42); sofaGuitar.rotation.z = -.22; party.add(sofaGuitar);
    const tbl = box(.5, .05, .32, woodM); tbl.position.set(.95, .4, -1.55); party.add(tbl);
    const cups = [0, 1].map(i => { const c = box(.05, .08, .05, new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: .8 })); c.position.set(.85 + i * .18, .445, -1.55 + i * .05); party.add(c); return c; });
    const partyL = new THREE.PointLight('#ffc890', 0, 4, 1.2); partyL.position.set(-.2, 1.6, -.8); g.add(partyL);
    // —— him, her, his friend ——
    const GU = { g0: { pose: 'guitar', step: 0 }, g1: { pose: 'guitar', step: 1 }, gsing: { pose: 'guitar', step: 1, up: 1, mouth: 1 }, gsing0: { pose: 'guitar', step: 0, up: 1, smile: 1 }, gbad: { pose: 'guitar', step: 0, blink: 1, bob: 1 }, ghold: { pose: 'guitar', step: 0, up: 1 } };
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, {
      phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, tired: { pose: 'phone', bob: 1, blink: 1 }, laugh: { pose: 'sitlaugh' },
      sit: { pose: 'sit' }, stand: { pose: 'stand' }, standphone: { pose: 'standphone' }, film: { pose: 'film' }, ...GU,
    });
    const her = makePerson({ top: 'mustard', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', shoe: 'shoe' }, {
      sit: { pose: 'sit' }, ask: { pose: 'sittalk', mouth: 1 }, smile: { pose: 'sit', smile: 1 }, c0: { pose: 'sitclap', step: 0, smile: 1 }, c1: { pose: 'sitclap', step: 1, smile: 1 },
    });
    const pal = makePerson({ top: 'teal', bottom: 'jean', hair: 'hairBlond', shoe: 'sneaker' }, {
      sit: { pose: 'sit' }, stand: { pose: 'stand' }, c0: { pose: 'clap', step: 0, smile: 1 }, c1: { pose: 'clap', step: 1, smile: 1 }, ...GU,
    });
    for (const P of [hero, her, pal]) { P.shadow.visible = false; g.add(P.root); }
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, bed, party, skyM, sun, moon, sheets, facedown, wallGuitar, sofaGuitar, sunL, lampL, lampG, moonL, partyL, hero, her, pal, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#8088b0', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3(), SKY = [new THREE.Color('#8cc4f0'), new THREE.Color('#ffc890'), new THREE.Color('#0a1028')];

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const ph = phaseAt(t), party = ph >= 4, night = ph === 3;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero, Hr = F.her, Pl = F.pal;
      F.bed.visible = !party; F.party.visible = party; F.partyL.intensity = party ? 3.2 : 0;
      let pos = [.22, .02, -1.0], fr = 'phone', flip = false, vis = true; H.root.visible = true;
      Hr.root.visible = Pl.root.visible = party;
      if (!party) {
        // the summer light: noon (July), golden afternoon (August), the dark (late August)
        F.skyM.color.copy(SKY[night ? 2 : ph === 2 ? 1 : 0]); F.sun.visible = !night; F.moon.visible = night;
        F.sunL.intensity = night ? 0 : ph === 2 ? 2.4 : 3.0; F.sunL.color.set(ph === 2 ? '#ffc890' : '#ffe2b0');
        F.lampL.intensity = night ? 2.2 : 0; F.lampG.visible = night; F.moonL.intensity = night ? 1.0 : 0;
        if (up) {
          if (ph >= 1) pos = [-.7, .02, -.95];
          fr = ph === 2 ? 'laugh' : ph === 3 ? 'tired' : (t % 2.9 < .1 ? 'blink' : 'phone');
          F.wallGuitar.visible = true; F.facedown.visible = false; F.sheets.forEach(s => { s.visible = false; });
        } else {
          const playing = t >= T.down; F.wallGuitar.visible = !playing; F.facedown.visible = t >= T.down;
          F.sheets.forEach((s, i) => { s.visible = ph >= i + 1; });
          if (playing) {
            if (ph <= 1) fr = Math.floor(t * 2) % 2 ? 'gbad' : 'g0';
            else if (ph === 2) fr = Math.floor(t * 4) % 2 ? 'g1' : 'g0';
            else fr = Math.floor(t * 4) % 2 ? 'gsing' : 'gsing0';
          }
        }
      } else {
        F.lampL.intensity = 0; F.sunL.intensity = 0; F.moonL.intensity = 0; F.lampG.visible = false;
        // the seat next to her goes to whoever can play: upstairs his friend, downstairs him
        const took = t >= T.take, song = ph >= 5, strum = Math.floor(t * 4) % 2;
        F.sofaGuitar.visible = !took;
        const asking = t >= 8.2 && t < 11.0;
        Hr.root.position.set(-.85, .02, -1.42); Hr.frame(song ? (up ? 'smile' : (Math.floor(t * 3.5) % 2 ? 'c1' : 'c0')) : asking ? (Math.floor(t * 3) % 2 ? 'ask' : 'sit') : 'sit'); Hr.face(cam, false);
        const player = up ? Pl : H, other = up ? H : Pl;
        player.root.position.set(-.2, .02, -1.42); player.frame(song ? (strum ? 'gsing' : 'gsing0') : took ? 'ghold' : 'sit'); player.face(cam, true);
        other.root.position.set(1.05, 0, -1.0);
        if (up) other.frame(t >= 11.05 ? 'film' : 'standphone'); else other.frame(song ? (Math.floor(t * 3.5 + 1) % 2 ? 'c1' : 'c0') : 'stand');
        other.face(cam, true);
        fr = null;
      }
      if (fr) { H.root.visible = vis; H.root.position.set(...pos); H.frame(fr); H.face(cam, flip); }
      const lit = party ? up && t < 11.05 : ['phone', 'blink', 'tired', 'laugh'].includes(fr);
      F.phoneL.intensity = lit ? 1.0 : 0; if (lit) F.phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2));
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, 2.1, -1.0)); post.dof.aper = 2; post.dof.maxCoc = 3;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .3; post.bloom.threshold = .88;
  }
  return { scene, update };
}
