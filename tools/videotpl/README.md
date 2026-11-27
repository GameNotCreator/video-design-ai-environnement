# Gabarit des vidéos pixel (Claude Code)

`sh tools/new-video.sh claude "<titre>"` → commit + push du CLAIM → `sh tools/videotpl/mk.sh N` → écrire :

- **story.js** : la source unique de vérité. `DUR`, `T` (au minimum `capOut`, `txt`, `txt2`, `txtOut`, `card`, `logo`,
  `line`, `plat`), `SHOTS` + `shotAt` (`room` / `black` / `card`), `CAPTION` (hook écrit, une ligne), `LINES`
  (`{ id, who, text, a, b, y? }` : boîtes de dialogue, `y` pour placer la boîte), `COUNTER` + `CNT` (horloge / âge /
  jour en haut, facultatif), `EVENTS` (sons, lus par mix.py), `TXT1`, `TXT2`, `LINE`, `PLAT`.
  Langue : `export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en'` puis
  `EN ? '…' : '…'` pour chaque texte → version anglaise avec `--q 'ss=1&lang=en'` (exemple : video-34).
- **scene.js** : `build()` → `{ scene, update(t, shot, cam, post, renderer) }` ; personnages `makePerson(look, frames)`
  de people.js (poses : phone, standphone, sitlaugh, sit, sittalk, look, write, stand, walk, wave, talk, push, film,
  kneel `{ open: 1 }`, guitar (`step`, `up`, `mouth`), clap, sitclap ; looks : beard, glasses, gown, gradCap, medal, buds, hairStyle…). Exemples : video-31 (salon,
  sauts dans le temps), video-33 (fête, feu, fumée), video-34 (deux étages, écran partagé).
- **extra.js** : `extra(g, t, H, layer)` (`'under'` / `'over'`) pour l'UI 2D en plus, `extraTexts(t)` pour readcheck.
- **mix.py** : piste de `assets/music/` coupée sur les temps forts + bruitages synthétisés (`tools/mixkit.py`).

Contrôles : `sh build.sh stills` (images de contrôle), `readcheck.mjs` (dans `build.sh master`). Rendu final :
`sh tools/videotpl/render.sh N` en arrière-plan (~10 min pour 24 s sans GPU), puis la version anglaise
`sh tools/videotpl/render_en.sh N` (utilise le mix du master). Livraison : `output/`, commit, push.
