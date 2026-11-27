# Studio vidéo WeLockIn : instructions pour les agents (Claude Code et Codex)

Ce dépôt est un studio de motion design piloté par agents. Il fabrique des vidéos TikTok pour **WeLockIn**
(https://welock.in), entièrement en code, dans le style **2.5D Pixel Art** (`hd-2d`) de la bibliothèque Lemo-Opuscar.
Deux agents y travaillent en parallèle (Claude Code et Codex), chacun dans **ses propres** dossiers `video/video-N/`.

Ordre de priorité quand deux règles se contredisent :
1. ce que le client écrit dans la conversation ;
2. ce fichier (`AGENTS.md`) ;
3. `STYLE.md` du style hd-2d (le look, fixe) ;
4. les guides Lemo-Opuscar (`DIRECTOR.md`, `TECHNIQUE.md`) ;
5. le playbook motion design (`docs/playbook-motion-design-fr.md`, intégré en §6 ci-dessous) ;
6. les skills TikTok (`tiktok-marketing`).

---

## 1. Les règles du client (permanentes)

| Règle | Détail |
|---|---|
| **Un dossier par vidéo** | Chaque demande de nouvelle vidéo crée `video/video-N/` (N = numéro suivant libre, §3). |
| **Style** | **Toujours** 2.5D Pixel Art (`hd-2d`) : https://lemomo-ai.github.io/lemo-opuscar/styles/hd-2d/ — sauf si le client demande explicitement autre chose. |
| **Produit** | WeLockIn, bloqueur d'apps cross-platform fait par des étudiants pour des étudiants. iOS, Windows, macOS. Mode *hard lock-in* : impossible à désactiver avant la fin du timer. Faits autorisés : `brand/welockin/facts.md`. |
| **Langue** | Vidéo en **français** pour TikTok et Facebook, version **anglaise** pour YouTube, **toujours** (jamais de français sur YouTube ; demandes du client, 25–26/11 et 28/11 : public TikTok francophone, YouTube anglophone ; `docs/performance-notes.md`). Voix, sous-titres, textes à l'écran et description suivent la langue de la version. On parle au client dans sa langue (français). |
| **Format** | **TikTok** : vertical 9:16, 1080×1920. |
| **Livrables à chaque output** | 1) la vidéo **MP4 compressée** ; 2) la **description TikTok** qui va avec. |
| **Script reçu = vidéo à générer** | Quand le client envoie un script, on produit la vidéo de bout en bout, sans aller-retour. |
| **Modifications** | Quand le client demande des changements, on les **applique sans discuter**, on re-rend, et on renvoie un **nouvel output + nouvelle description** (version suivante, même dossier). |
| **Assets** | Le client enverra des assets : ils vont dans `assets/` (partagés) ou `video/video-N/assets/` (propres à une vidéo), avec une ligne dans le README correspondant. |

Conséquence sur les guides : **pas de tour de questions, pas d'attente de validation**. Le "brief" de Lemo-Opuscar
(AGENTS.md de la bibliothèque, Workflow §1) et les étapes "attendre mon OK" du playbook sont déjà répondus par ce
fichier. Les beats, stills et contact sheets se font quand même, mais comme **contrôles internes**. On ne revient vers
le client que pour quelque chose que lui seul peut fournir (un fait manquant, un asset), et même là on livre d'abord
avec un défaut raisonnable si c'est possible.

Réponses par défaut au brief Lemo : langue anglais ; voix Kokoro anglaise (TTS offline) sauf voix fournie ;
musique : **la piste la plus adaptée de la bibliothèque `assets/music/`** (§5 étape 6), sinon score synthétisé avec `core/audio/` ; pas de storyboard à valider ; matériel = `brand/` + `assets/`.

---

## 2. Installation (une commande, idempotente)

```sh
sh tools/setup.sh      # bibliothèque Lemo-Opuscar dans .lemo-opuscar/ + paquets core/voice/music + ffmpeg 7+
. tools/env.sh         # dans chaque shell qui lance un outil de rendu : LIB, PATH (ffmpeg 7+), LEMO_ANGLE
```

- La bibliothèque Lemo-Opuscar (styles, guides, outils `core/`) est clonée dans `.lemo-opuscar/` (ignoré par git) :
  `$LIB` partout dans ses guides = ce dossier. Les deux agents partagent la même copie (le script gère un verrou).
- ffmpeg : `mux.sh` exige ffmpeg 7+. Si le système a une version plus ancienne, `setup.sh` installe le binaire statique
  du paquet PyPI `imageio-ffmpeg` dans `.tools/` et `env.sh` le met en tête du `PATH`.
- Sans GPU (VM cloud), `env.sh` exporte `LEMO_ANGLE=swiftshader` : sinon les rendus WebGL du style sortent noirs.
- La reconnaissance vocale (`asr_check.py`, faster-whisper) télécharge son modèle depuis Hugging Face au premier usage.

### Skills installés

| Skill | Où | Usage ici |
|---|---|---|
| `lemo-opuscar` | `.claude/skills/lemo-opuscar/` (lanceur) → bibliothèque dans `.lemo-opuscar/` | réalisation et production du film |
| `tiktok-marketing` (8 sous-skills `tt-*`) | `.claude/skills/tiktok-marketing/` | hook (`tt-hook-scripter`), audit du script parlé (`tt-humanizer --mode audit`), description (`tt-caption-writer`) |
| `youtube-audio` | `.claude/skills/youtube-audio/` | lien YouTube → MP3 (yt-dlp + ffmpeg) dans `assets/music/`, mesure BPM/drops, choix de la musique de chaque TikTok |
| `social-media-skills` (plugin claude.ai, Claude Code) | plugin « Social Media Skills » | idées et scripts : `tiktok-script`, `reels-script`, `youtube-shorts`, `short-form-video-script`, `hook-writer`, `viral-reverse-engineering` ; croissance : `tiktok-growth`, `instagram-growth`, `facebook-strategy` ; mesure : `analytics-and-reporting`, `experimentation-and-ab-testing`, `thumbnail-design` |
| `marketing` (plugin claude.ai, Claude Code) | plugin « Marketing » d'Anthropic | `campaign-plan`, `performance-report`, `competitive-brief`, `brand-review` |
| Windsor.ai for Social Media (connecteur claude.ai) | outils `mcp__Windsor_ai_for_Social_Media__*` | **source principale** des stats privées : TikTok et YouTube reliés (rétention seconde par seconde, pays, sources de trafic) ; Instagram et Facebook à relier : `docs/stats/windsor.md` |
| Metricool (connecteur claude.ai) | outils `mcp__Metricool_Social_Media_Management__*` | secours, aucun réseau relié au 25/11 ; meilleure heure de publication : `docs/stats/metricool.md` |

Ces skills/plugins complètent `tiktok-marketing` sans le remplacer ; s'ils contredisent ce fichier, ce fichier gagne.
Ils ne sont pas visibles par Codex (plugins et connecteurs claude.ai).

Codex trouve les mêmes skills via les liens symboliques de `.agents/skills/`. Sous-skills TikTok :
`.claude/skills/tiktok-marketing/skills/<tt-nom>/SKILL.md` (leurs chemins `../../references/` sont relatifs à ce dossier).

---

## 3. Numérotation et coordination Claude / Codex

- Réserver un numéro : `sh tools/new-video.sh <claude|codex> "<titre court>"`. Le script regarde le dossier local **et
  toutes les branches d'origin**, prend le plus grand `video-N` + 1, crée `video/video-N/` avec un fichier `CLAIM`
  (agent, titre, date, branche).
- **Committer et pousser le `CLAIM` tout de suite** (`git add video/video-N/CLAIM && git commit -m "video-N: claim" && git push`),
  avant de commencer à produire : c'est ce qui empêche l'autre agent de prendre le même numéro.
- On ne touche **jamais** au dossier vidéo d'un autre agent (voir son `CLAIM`). Une modification demandée sur une vidéo
  de l'autre agent se fait dans une nouvelle version **dans son dossier** seulement si le client le demande explicitement.
- Les fichiers partagés (`AGENTS.md`, `brand/`, `assets/`, `tools/`) : modifications petites et ciblées, pour limiter les
  conflits entre branches.
- Ne jamais tuer un processus qu'on n'a pas lancé (l'autre agent peut être en train de rendre).

---

## 4. Le dossier d'une vidéo

`video/video-N/` est le **project folder** au sens de Lemo-Opuscar (partout où ses guides disent `films/<name>/`).

```
video/video-N/
├── CLAIM                    agent, titre, date, branche
├── script.md                le script reçu, verbatim, + journal des versions (v1, v2… et ce que le client a demandé)
├── TREATMENT.md             traitement Lemo (DIRECTOR.md §4) + beats horodatés (playbook)
├── CREDITS                  tous les assets tiers et leur licence (TECHNIQUE.md §11)
├── build.sh                 une commande : draft | master | deliver (§5)
├── index.html, *.js         la page : window.render(t), DUR, READY, EV, TEXTS
├── timeline.js              sections, tempo, beats, hits : la source unique de vérité
├── lines.json, mix.py       voix (Kokoro) et mix (score + foley + voix)
├── fonts/, assets/          polices auto-hébergées (OFL), assets propres à cette vidéo
├── out/                     (ignoré par git) frames, wav, rendus intermédiaires, master
├── stills/                  (ignoré par git) stills et contact sheets de travail
└── output/                  LIVRABLES, commités
    ├── video-N_vK.mp4           MP4 compressé TikTok (vK = version, v1 au premier rendu)
    ├── video-N_vK_tiktok.md     description TikTok de cette version
    ├── video-N_vK_poster.jpg    poster / cover suggérée
    ├── video-N_vK_sheet.jpg     contact sheet finale (1 frame par beat)
    └── subtitles_en.srt         sous-titres (brûlés dans l'image, donc pas nommés comme la vidéo)
```

Les versions précédentes restent dans `output/` (on ne les écrase pas).

---

## 5. Le pipeline d'une vidéo (script → MP4 + description)

Lire d'abord, à chaque vidéo : `$LIB/AGENTS.md` (Style and story, Workflow), `$LIB/DIRECTOR.md`, `$LIB/TECHNIQUE.md`,
`$LIB/styles/hd-2d/STYLE.md`, `brand/welockin/BRAND.md`, `brand/welockin/facts.md`.

1. **Réserver** le numéro (§3), enregistrer le script verbatim dans `script.md`.
2. **Vérité produit** : tout fait énoncé est dans `facts.md`. Rien d'inventé (chiffres, features, Android, classements).
3. **Hook et texte à l'écran** (`tt-hook-scripter`) : la promesse tombe dans les **1–3 premières secondes**, voix ET texte
   à l'écran (beaucoup regardent sans le son). Le texte du script est celui du client : on ne le réécrit pas ; on dérive le
   texte à l'écran et on passe `tt-humanizer --mode audit` sur les lignes parlées. Si l'audit trouve un vrai problème, on
   livre quand même le script tel quel et on le signale en une ligne au client.
3b. **Ce qui marche (boucle d'amélioration, à chaque nouvelle vidéo ou proposition de scripts)** :
   1. Rafraîchir les stats :
      - **Windsor.ai** (connecteur claude.ai) : rétention seconde par seconde, temps moyen, % vus en entier, pays et
        sources de trafic de chaque vidéo TikTok et YouTube (et Instagram/Facebook une fois reliés). Procédure, appels
        et fusion (`tools/windsor_merge.py`) : `docs/stats/windsor.md`. Essai limité aux 30 derniers jours.
      - **Metricool** (si des comptes y sont reliés) : `docs/stats/metricool.md`.
      - Toujours en plus : `. tools/env.sh && python3 tools/stats.py` → `docs/stats/<date>/youtube.csv` et `tiktok.csv`
        (stats publiques : YouTube `@welockin-students`, TikTok `@welockin.study` ; Instagram `mystudy.skills` et
        Facebook `Welockin` n'en ont pas sans connexion). Si le réseau bloque, prendre la dernière date de `docs/stats/`.
   2. Ajouter dans `docs/stats/videos.csv` les vidéos publiées depuis (dossier ↔ id YouTube ↔ id TikTok ↔ concept).
   3. Mettre à jour `docs/performance-notes.md` : tableau, ce qui monte, ce qui descend, et ce que ça change aux règles
      (comparer des vidéos publiées le même jour ; une vidéo de moins de 48 h n'est pas encore jugée).
   4. Appliquer ses **règles de script** (section « Règles » du fichier) au choix des concepts et au traitement, et dire
      au client en une ligne laquelle a guidé le choix.
4. **Traitement** (`TREATMENT.md`, DIRECTOR.md §4) : 3 structures candidates et le choix ; logline ; benchmark ; shot list ;
   **beats horodatés (8 lignes max)** ; cue map ; table son ; design des sous-titres. Puis seulement, lire `DEMO.md` et la
   démo (`. tools/env.sh && sh .claude/skills/lemo-opuscar/scripts/setup.sh demo hd-2d` : sans `env.sh` la bibliothèque serait clonée dans `~/lemo-opuscar`) pour en apprendre les techniques, jamais l'histoire.
5. **Look** : rendre avec le vrai code les **4 stills** du playbook (hook, milieu, climax, outro) en contact sheet 2×2,
   vérifier contre `STYLE.md`, la charte et les zones sûres TikTok (§7). Avec personnage : model sheet du héros.
6. **Production** (TECHNIQUE.md) : voix → `asr_check.py` jusqu'à exit 0 → musique + foley → animation → mix.
   **Musique** : pour chaque nouveau TikTok, choisir dans `assets/music/README.md` la piste la plus adaptée à l'arc,
   au tempo et au moment fort du film (skill `youtube-audio`, "Choose the track") ; la couper *dans* le morceau sur les
   temps forts, son drop sur le moment fort ; noter le choix dans `TREATMENT.md` et `CREDITS`, et "Utilisée dans" au
   catalogue (varier d'une vidéo à l'autre). Piste absente ou réseau YouTube bloqué : score synthétisé, et le dire en une ligne.
7. **Revue** (playbook étape D + DIRECTOR.md §11) : contact sheet **une frame par beat et 0,3 s après** ; note chaque plan
   /10 sur lisibilité, rythme, continuité, branding, hook ; corriger tout ce qui est **≤ 7**, ne pas toucher aux 9+ ;
   2 à 4 rounds max. `readcheck.mjs` doit passer. Test "une phrase" sans le son (§6).
8. **Draft** 540×960 à 30 fps pour vérifier le rythme, puis **master** 1080×1920 à **60 fps** (le style anime la caméra et
   la lumière à chaque frame de sortie) ; `mux.sh` : −14 LUFS, true peak ≤ −1 dBTP, grain 0 (style pixel).
   **Sans GPU** (VM cloud, SwiftShader : ~15 s/frame en supersampling ×2, ~4 s en ×1) : master à **30 fps** avec
   `--q ss=1`, 3 workers (≈ 25 min pour 18 s). TikTok accepte très bien le 30 fps.
9. **Compression TikTok** : `sh tools/compress.sh out/master.mp4 output/video-N_vK.mp4` (H.264 High, yuv420p BT.709,
   AAC 192k, +faststart). Vérifier : durée, 1080×1920, taille raisonnable (viser < 30 Mo pour 60 s).
10. **Description TikTok** (`tt-caption-writer`) → `output/video-N_vK_tiktok.md` (format §8).
11. **Contrôles finaux** (DIRECTOR.md §11) : pas de frames noires/NaN, loudness, sous-titres en sync et hors du sujet,
    `grep -rniE "lemo ?lab|opus 5\.5|hd-2d|octopath|square enix" video/video-N --exclude-dir=out --exclude=TREATMENT.md`
    ne trouve rien à l'écran ; regarder les dernières secondes du film.
12. **Livrer** : commit + push (`output/`, sources, `TREATMENT.md`, `CREDITS`, `build.sh`) ; envoyer au client le MP4 et
    la description (Claude Code : `SendUserFile` ; et coller la description dans le message). Dire où est le dossier,
    que `CREDITS` liste les assets tiers.

`build.sh` (une commande, sans chemins `../..`) :

```sh
#!/bin/sh
# usage: sh build.sh draft | master | deliver <K>
set -e
HERE=$(cd "$(dirname "$0")" && pwd -P)
STUDIO=$(cd "$HERE/../.." && pwd -P); . "$STUDIO/tools/env.sh"
cd "$LIB"
case "${1:-master}" in
  draft)  node core/render/video.mjs "$HERE" --size 540x960 --fps 30 --out "$HERE/out/draft.mp4" ;;
  master) node core/render/events.mjs "$HERE" --size 1080x1920
          node core/render/video.mjs "$HERE" --size 1080x1920 --fps 60 --out "$HERE/out/video.mp4"
          "$LIB/.venv/bin/python" "$HERE/mix.py"
          sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/master.mp4" 60 0 ;;
  deliver) N=$(basename "$HERE"); sh "$STUDIO/tools/compress.sh" "$HERE/out/master.mp4" "$HERE/output/${N}_v${2:?version}.mp4" ;;
esac
```

### Modifications (v2, v3…)

Le client demande un changement → on l'applique tel quel, sans débat, dans le même dossier ; on ajoute une entrée au
journal de `script.md` ("vK : ce qui a été demandé / ce qui a changé") ; on re-rend ce qui est touché (stills des beats
concernés, puis master) ; on livre `output/video-N_vK.mp4` + `output/video-N_vK_tiktok.md` (description mise à jour si le
contenu a changé, sinon reprise de la précédente). Un round de modifs = changer **seulement** ce qui est demandé
(DIRECTOR.md §11).

---

## 6. Le playbook motion design (intégré)

Source complète : `docs/playbook-motion-design-fr.md` (Notion "Playbook Opus 5.5 : Motion design de A à Z").
**Le prompt, c'est 10 %. Le harness, c'est 90 %.** Ce qu'on en garde ici (la route A, "HTML nu + seek(t) + Playwright +
FFmpeg", est exactement ce que fait Lemo-Opuscar : sa fonction s'appelle `window.render(t)`) :

**Contrat de rendu**
- Chaque film est une **fonction pure du temps** : `render(t)` peint la frame t. Même entrée = mêmes frames.
- Interdit dans le rendu : transitions/animations CSS, `requestAnimationFrame` comme horloge, `Date.now()`,
  `Math.random()` non seedé (utiliser `mulberry`/`hash` de `/core/lib.js`), `setTimeout`, état accumulé entre frames.
- Polices auto-hébergées dans le dossier du film, attendre `document.fonts.ready` avant `READY`.
- Pour la preview à la main : touches Espace (pause) et flèches (frame par frame) bienvenues dans `index.html`.

**Process** (sans les pauses de validation, cf. §1) : beats horodatés (8 lignes max) → 4 stills (hook, milieu, climax,
outro) → code + preview → contact sheet (1 frame par beat + 0,3 s après) → notes /10, corriger ≤ 7 → draft 540p 30 fps →
master 60 fps → recadrage : ici le master **est** le 9:16 (texte important dans la zone sûre, §7).

**Son** (sinon "ça reste un GIF cher") : chaque SFX sur le pic réel de son événement (pilotés par `window.EV`) ; grille de
beats mesurée ; le drop visuel = le drop audio ; master −14 LUFS, true peak −1 dBTP ; pas de whoosh de stock posé "à peu près".

**Branding : les 12 règles anti "look IA"**, adaptées au style 2.5D Pixel Art :
1. Un accent, un seul : le **rouge fez `#C41919`**, porté par le héros (c'est aussi la règle du style : la seule couleur
   saturée qu'aucun décor n'utilise).
2. Les vrais mots du client (son script).
3. De vrais chiffres, sourcés (`facts.md`), ou aucun chiffre.
4. Le **vrai logo** (`brand/welockin/logo-mascot.png`) sur la carte de fin, jamais redessiné. Le personnage-mascotte peut
   devenir un sprite pixel, le logo non.
5. Un style nommé, pas "premium moderne" : c'est `hd-2d`, son `STYLE.md` fait foi.
6. Des états, pas une vibe : chaque beat change quelque chose de visible (une lumière s'allume, un écran s'éteint, un cadenas se ferme).
7. **Une seule chose bouge à la fois** au premier plan (la caméra et la lumière glissent toujours, c'est le style).
8. Mouvements doux : courbes monotones, pas d'overshoot (springs damping ≥ 0,72 pour l'UI), jamais de rebond cartoon.
9. Pas de particules, chrome ou arc-en-ciel *décoratifs* : les particules du style (poussière, pluie, braises) ne sont
   permises que si elles ont une source et une raison dans le décor.
10. Typo assez grosse pour un téléphone (§7).
11. Zone sûre 9:16 dès le storyboard (§7).
12. L'agent se note et se corrige (étape 7 du pipeline).

**Test humain** : montrer la vidéo **sans le son**. Si on la résume en une phrase ("il a verrouillé son téléphone et
tout s'est éteint sauf sa lampe"), c'est bon. Sinon, trop de choses bougent.

**Diagnostic quand c'est moche** : saccade à l'export → timers ou transitions CSS, repasser en `render(t)` pur ;
ça fait cheap, ça rebondit → easing bounce ; une feature inventée → relire `facts.md` ; rendu WebGL noir → `LEMO_ANGLE=swiftshader` ;
même film que tout le monde → pas de traitement ni d'états, refaire §5 étape 4.

La charte par défaut du playbook (fond `#0B0B0B`, accent `#E85D04`, Geist/Inter, "pas de particules") **ne s'applique
pas** : elle est remplacée par la charte WeLockIn (`brand/welockin/BRAND.md`) et le style `hd-2d`.

---

## 7. Règles TikTok (format vertical)

- **1080×1920**, 9:16. Toutes les pages se mettent en page depuis `innerWidth × innerHeight` ; `--size 1080x1920` à
  **tous** les outils de rendu (`still`, `video`, `events`, `readcheck`).
- **Zone sûre** (l'UI TikTok recouvre le reste) : texte et sujet clé dans x ∈ [60, 940], y ∈ [210, 1480].
  Rien d'important dans les 430 px du bas (légende, son, pseudo) ni dans les 140 px de droite (boutons).
- **Hook dans les 1–3 premières secondes** (règle TikTok et DIRECTOR.md §3) : pas d'ouverture lente sur un plan large
  muet ni de logo en premier. En hd-2d : ouvrir *in the middle of the room* (boîte de dialogue qui tape déjà) ou sur une
  image forte, puis élargir.
- **Durée** : la plus courte qui porte l'idée (le taux de complétion est le signal n°1). Défaut 20–40 s ; jamais de
  remplissage. (Le défaut 30–60 s de DIRECTOR.md est remplacé par celui-ci.)
- **Sous-titres brûlés** dans l'image, toujours (lecture sans le son). Style hd-2d : serif italique (EB Garamond ou
  Cormorant) sur bande sombre douce, **≥ 58 px** en 1080 de large, une ligne par clip voix (2 lignes max), dans la zone sûre
  (bas du texte au-dessus de y = 1480). Le texte de hook à l'écran : Cinzel ou la serif, ≥ 72 px.
- **Cadrage vertical du style** : le héros fait 1/12–1/8 de la hauteur dans les plans larges (règle du style), mais les
  moments clés le montrent à ≥ 1/4 de la hauteur (DIRECTOR.md §8) : plongée basse et proche, *dive low and close*.
- **Fin** : carte crème `#F5F0E8` avec le logo réel, "welock.in", "iOS · macOS · Windows", tenue ≥ 2 s. Pas de
  "follow for more".
- **Export propre** : pas de filigrane, pas de crédit LemoLab, jamais "HD-2D" ni un jeu de référence nommé à l'écran.

---

## 8. La description TikTok (`output/video-N_vK_tiktok.md`)

Écrite avec `tt-caption-writer` (règles de voix : `.claude/skills/tiktok-marketing/references/voice-rules.md`), en anglais :

```markdown
# video-N vK — TikTok

## Caption
<première ligne = une raison de lire ou de commenter ; court ; pas la phrase du hook répétée mot pour mot>
<1–3 lignes max ; welock.in mentionné une fois>

#hashtag1 #hashtag2 #hashtag3 #hashtag4

Characters: <nombre> / 2200

## Settings
- Viewer: PUBLIC_TO_EVERYONE
- Comments: on · Duet: off · Stitch: off
- Content disclosure: "Your brand" on (commercialContent + brandOrganic: on promeut notre propre produit)
- Cover: <timestamp conseillé> (output/video-N_vK_poster.jpg) — à régler à la main sur chaque plateforme : sinon YouTube prend souvent la carte de fin (logo)
- Sound: original audio

## On-screen hook (0–3 s)
<texte du hook à l'écran> / <ligne parlée>
```

- 3 à 5 hashtags, portée mixte (un large type `#studytok`, un ou deux de niche `#focus` `#productivity`, un spécifique).
- Pas de vocabulaire "IA" (`leverage`, `streamline`, `unlock`…), tirets cadratins quasi absents, noms propres en capitales.
- Publication : **automatique, 6 vidéos par jour, nouvelles vidéos seulement** (27/11), toutes les 3 h de 08:00 à 23:00, par Metricool (demandes du client le 26/11) : comptes, réglages et
  procédure dans `docs/posting.md`, journal dans `docs/posting-log.md`, file d'attente dans `docs/backlog.md`. Réseaux :
  TikTok, Facebook, Instagram (FR, de jour) et YouTube (EN, 3 par nuit à 00:00, 02:00, 04:00 pour les États-Unis, 28/11). Jamais LinkedIn ni les comptes perso sans demande explicite du client.

---

## 9. Git

- Committer : sources de la vidéo, `TREATMENT.md`, `CREDITS`, `build.sh`, `script.md`, `output/` (MP4 compressé,
  description, poster, contact sheet, srt). Ne pas committer `out/`, `stills/`, la bibliothèque `.lemo-opuscar/`, `.tools/`.
- Messages de commit : `video-N: <ce qui a changé>`.
- Ne jamais committer de secrets (`.env`, clés Publora/Apify).
