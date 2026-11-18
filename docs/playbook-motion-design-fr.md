<!-- Source: Notion "Playbook Opus 5.5 — Motion design de A à Z", https://funky-knot-8d5.notion.site/Playbook-Opus-5-5-Motion-design-de-A-Z-3eac5186db6881c9af69f7e60cc6d24d, exported 2026-11-18. Integrated into AGENTS.md §6. -->

# Playbook Opus 5.5  Motion design de A à Z

> 💡 

  Le process complet, de l'installation jusqu'au MP4 frame-perfect.

  **Le prompt, c'est 10 %. Le harness, c'est 90 %.**


---


## Process classique de A à Z


[video:  https://supercut.ai/share/chapelon/xnq01yJrieLv43Y7rsdkY3]


Le contexte

- **22 septembre 2026** — Anthropic sort Claude Opus 5.5.
- **24 septembre** — 48 h plus tard, X est inondé de showreels de 15 secondes.
- Le post fondateur : Stephan Livera, Opus 5.5 en effort Max, un seul prompt, une vidéo de motion design complète.
> 💡 

  **Stephan Livera** — @stephanlivera · 24 sept.

  *« make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out. »*

  → [Voir le post sur X](https://x.com/stephanlivera/status/2103315922098470926)


---


##  La règle que tout le monde rate

> 💡 

  **Opus 5.5 ne sort pas une vidéo. Il sort du texte.**

  Concrètement : un fichier HTML qui sait dessiner n'importe quelle frame à partir du temps.

Une seule fonction : `window.seek(t)`

- `t = 0.00` → première image
- `t = 15.00` → dernière image
**Comment ça devient une vidéo :** Playwright ouvre Chromium → appelle `seek(0)` → screenshot → `seek(1/60)` → screenshot… → FFmpeg assemble le tout.

> 💡 

  **Tu dépends de…**

  `setTimeout`, transitions CSS, `Date.now()`

  → l'export tremble.

> 💡 

  **Tout est fonction pure de t**

  Même entrée = mêmes frames, à chaque run.

  → le film est déterministe.

> C'est toute la différence entre un screen record et un motion de studio.


---


## Les 3 routes possibles

> 💡 

  **ROUTE A — HTML nu**

  `seek(t)` + Playwright + FFmpeg

  Zéro framework. C'est celle qu'Opus choisit tout seul. La plus virale.

  **→ Pour un premier motion en 10–40 min.**

> 💡 

  **ROUTE B — HyperFrames**

  HTML + GSAP, CLI preview / render.

  `npx skills add heygen-com/hyperframes`

  ou dans Claude Code : `/plugin install hyperframes@claude-plugins-official`

  **→ Pour une usine à contenu de marque.**

> 💡 

  **ROUTE C — Remotion**

  React, templates réutilisables.

  `npx skills add remotion-dev/skills`

  **→ Pour une librairie de templates data-driven.**

 Comparatif HyperFrames vs Remotion : [claudevideo.org — guide HyperFrames / Remotion / Claude Code](https://claudevideo.org/guides/hyperframes-remotion-claude-code)


---


## Installation (10 minutes, une seule fois)


### Le matériel

- [x] Abonnement **Claude Pro / Max / Team** (Opus 5.5 au sommet de la gamme)
- [x] **Claude Code à jour** (2.1.280+ d'après les guides 2026)
- [x] **Mac ou Linux.** Windows fonctionne, mais c'est plus pénible côté FFmpeg / Chrome.

### Les commandes (macOS)

```bash
# 1. Outils système
brew install node ffmpeg python git
node -v   # il faut Node 22+

# 2. Python
pip install numpy playwright pillow
python -m playwright install chromium

# 3. Dossier studio
mkdir ~/motion-studio && cd ~/motion-studio
npm init -y
npm i -D playwright
npx playwright install chromium

# 4. Lancer Claude Code sur Opus 5.5
claude --model claude-opus-5-5
```


### Dans Claude Code

```plain text
/model claude-opus-5-5
/effort max
```


### Les niveaux d'effort qui comptent vraiment

| Niveau | Quand l'utiliser |
|---|---|
| **medium** | Corrections, re-render d'une scène |
| **high** | Draft propre |
| **xhigh** | Nouveau film |
| **max** | Showreel / lancement où les 3 premières secondes doivent claquer |

> 💡 

  Opus 5.5 réfléchit toujours : on ne peut plus désactiver le thinking. **Le seul vrai curseur, c'est l'effort.**

  → [Opus 5.5 in practice — rohitghumare.com](https://rohitghumare.com/blog/opus-5-5-in-practice/)

**Pricing API** (si tu sors de l'abonnement, d'après la même source) : 4 $ input / 20 $ output par million de tokens, lectures de cache à 0,20 $. Un showreel one-shot coûte souvent quelques dollars. Livera était sur le plan à 20 $.


---


## Le fichier `CLAUDE.md` (à créer AVANT le premier prompt)

> 💡 

  Claude Code relit `CLAUDE.md` à chaque run. **C'est ta charte permanente.**

  Sans lui, tu patches 40 lignes à chaque vidéo et Opus retombe dans le slop.

Crée `CLAUDE.md` à la racine du dossier :

```markdown
# Règles du motion studio

## Contrat de livraison
- Chaque film est une fonction pure du temps : window.seek(t) peint la frame t.
- Interdit dans seek(t) : transitions CSS, requestAnimationFrame comme horloge,
  Date.now(), Math.random() non seedé, setTimeout, état accumulé entre les frames.
- Un seul fichier index.html par film. Polices en base64 ou stack système déclarée.
- Boutons Play / Replay / Pause. Flèches = frame précédente / suivante.

## Charte par défaut (remplace par la tienne)
- Fond : #0B0B0B
- Texte : #F4F1EA
- Accent unique : #E85D04
- Titres : Geist / Inter Tight
- Corps : Inter
- Style : bords nets, peu d'ombres, un seul accent, grosse typo
- Interdit : dégradé arc-en-ciel, particules, chrome lumineux, emoji,
  lorem ipsum, rebond cartoon, flip 3D gratuit

## Mouvement
- Springs en forme fermée. Damping ≥ 0.72. Overshoot minuscule.
- Une seule chose bouge à la fois, sauf si un slider pilote une transformation continue.
- Une forme / un système visuel du début à la fin. Des transformations, pas de cuts,
  sauf hard cut demandé.
- Boucle : frame 0 = dernière frame, en position ET en vélocité.

## Process obligatoire
1. Beats horodatés (8 lignes max). Attendre validation.
2. 4 stills (hook, milieu, climax, outro). Attendre validation.
3. Code + preview navigateur.
4. Contact sheet : 1 frame par beat + 0,3 s après.
5. Notes /10. Corriger tout ce qui est sous 8.
6. Export draft 540p 30 fps sans flou.
7. Export master.

## Export
- Playwright Chromium. Après chaque seek : attendre 2 rAF avant le screenshot.
- 30 fps draft / 60 fps master.
- Master : 4 sous-frames, mix, H.264 yuv420p crf 18, +faststart.
- Audio : -14 LUFS, true peak -1 dBTP.
```

> 💡 

  Ajoute aussi **tes codes hex, le chemin de ton logo, l'URL de ton produit.** Une session = une marque.


---


## Préparer le dossier de marque (2 minutes)

```plain text
motion-studio/
├── CLAUDE.md
├── brand/
│   ├── logo.svg
│   ├── palette.txt
│   ├── screenshots/
│   └── reference.mp4      (optionnel mais décisif)
├── facts.md               (chiffres + sources)
├── index.html             (Opus le crée)
├── render.py              (Opus le crée)
└── out/
```


### Exemple de `facts.md`

```markdown
- 12 400 équipes
- +38 % de temps gagné — source : page /customers, septembre 2026
- Prix : 29 $ / mois
- Aucune métrique inventée.
```

> 💡 

  **Sans faits sourcés, Opus invente. Toujours.**


---


##  Le brief de réalisateur (le vrai process, pas le one-liner)

> 💡 

  **Un one-liner**

  → un film viral générique.

> 💡 

  **Un brief de réalisateur**

  → TON film.

À copier-coller dans le **PREMIER message**, en effort max :

```plain text
Tu es mon motion designer et mon ingénieur de rendu.
Lis CLAUDE.md et le dossier brand/. Ne code RIEN tant que je n'ai pas validé les beats et les 4 stills.

FILM
- Durée : 15 secondes
- Format master : 1920x1080 30 fps (draft) puis 60 fps
- Formats livrables : 16:9, 1:1 1080, 9:16 1080x1920 depuis la MÊME timeline
- Sujet : [NOM DU PRODUIT] — [promesse en une phrase]
- Audience : [qui]
- Canal : [X / site / ads]
- Référence de style nommée : [ex. Linear launch / Stripe docs / Apple bumper]
- Fichier de référence : brand/reference.mp4 si présent

ÉTATS (à remplacer)
0.0–2.5   Hook typo : "[ligne]"
2.5–6.0   La forme devient [écran / sujet 1]
6.0–10.0  Transformation vers [écran / sujet 2], clic curseur
10.0–13.0 Preuve : [vrai chiffre]
13.0–15.0 Outro logo + URL. Si boucle : retour à l'état 0.

RÈGLES
- Une forme continue. Pas de cut.
- Vrais mots, vrais chiffres depuis facts.md. Vrai logo SVG.
- Springs. Pas de rebond.
- seek(t) pur.
- Interdits de CLAUDE.md.

SORTIE ATTENDUE MAINTENANT
1. 6 beats horodatés
2. Liste des calques
3. Plan son (silence / SFX en code / piste Mixkit)
STOP. Attends mon OK.
```

> 💡 

  Ensuite seulement, tu fais coder `index.html`. **C'est le process des films qui ne se ressemblent pas.**


### Le workflow en 7 étapes vu partout sur X cette semaine

1. Dossier vide
1. Dire le produit (site + durée)
1. Partager des références
1. Une page web
1. Preview navigateur
1. Enregistrer frame par frame
1. Corriger
> 💡 

  **Muhammad Ayan** — @socialwithaayan · 28 sept.

  Opus 5.5 comme motion designer, en 7 étapes, sans After Effects. En citation : son guide complet sur les vidéos de lancement produit (66 s, 60 fps, vraie UI — là où un studio facture 5 000 $ pour 60 s).

  → [Voir le post sur X](https://x.com/socialwithaayan/status/2104592545892446671)


---


## Les prompts à avoir (du plus simple au plus studio)

[tab] 
One-shot viral

> 💡 

  **10 min · générique.** À utiliser UNE fois pour voir le moteur. Pas pour un client.

```plain text
make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out.
```

→ [Le post original de Stephan Livera](https://x.com/stephanlivera/status/2103315922098470926)

One-shot brandé

> 💡 

  **15–25 min.** Même structure + ta marque dans la phrase + « termine sur [Marque] + URL » + « une seule couleur d'accent [#…] » + « pas de template dégradé ».

Exemple qui marche encore :

```plain text
Make a 15-second showreel at 1920x1080, 30fps. Keep it in one self-contained index.html. HTML, CSS, JS, SVG or Canvas only. No Remotion, no HyperFrames, no CDN, no MCP, no external URLs. Bold type and simple shapes. End on [TA MARQUE]. Play and Replay. window.seek(t). Do not render the MP4 yet.
```

→ [Workflows vidéo Claude — agent-signal.ai](https://agent-signal.ai/en/blog/claude-video-generation-workflows)

UI morph

> 💡 

  **Le plus « cher » visuellement.** Idée de @twoclipping : une seule forme, 8–12 états d'UI, un vrai slider, ~120 BPM, boucle exacte.

**États typiques :** bouton → loader → player → slider → toggle → onglets → chart → command palette → toast.

→ [Post de @twoclipping sur X](https://x.com/twoclipping/status/2103835273813496100)

→ [Prompt complet — jasonzhu.ai](https://jasonzhu.ai/en/prompts/claude-opus-5-5)

Lancement produit

> 💡 

  **Product launch / landing reveal.** Template ouvert par @notdwd : inputs → direction → structure frame par frame → build seek(t) → gotchas → 4 stills avant le rendu complet.

→ [Post de @notdwd sur X (prompt open source)](https://x.com/notdwd/status/2104138101102621133)

> 💡 

  **Règle :** ne jamais sauter le bloc « 4 stills avant le film complet ». C'est ce qui évite de perdre 20 minutes de rendu sur un mauvais hook.

Loops LinkedIn (FR)

> 💡 

  **Méthode Eric Djavid.** HTML + CSS pur, une charte, une transformation « A devient B », boucle de 5–9 s, une seule chose bouge, pas de rebond.

**Easings :** `cubic-bezier(.6,0,.2,1)` et `cubic-bezier(.2,.8,.2,1)`

**Micro-prompts ensuite :** bouton → player · recherche → résultats · carte → workspace · courbe SVG · dock magnétique · titre caché.

→ [Formulaire motion design Opus — ericdjav.com](https://www.ericdjav.com/forms/motion-design-opus)

SaaS / app native

> 💡 

  **Web** = pointe vers le repo (vrais tokens de design).

  **Mobile** = screenshots + « n'invente aucune feature ».

  **Toujours** : storyboard d'abord.

→ [Claude Opus 5.5 motion design — getreely.co](https://getreely.co/blog/claude-opus-5-5-motion-design)


---


## La boucle de production (ce que tu fais VRAIMENT)


### Étape A — Beats

Tu valides l'ordre, la vérité produit, le timing. Si un beat est trop chargé, tu le coupes en deux.


### Étape B — 4 stills

```plain text
Donne-moi 4 images PNG : t=1.2, t=5.0, t=9.5, t=14.2. Contact sheet 2x2. N'exporte pas la vidéo.
```

Tu juges : lisibilité, marges de sécurité 9:16, accent unique, logo net.


### Étape C — Preview live

Ouvre `index.html`. **Espace** = pause. **Flèches** = frame par frame.

> 💡 

  Si ça « flotte » : tes easings sont mous, ou trois choses bougent en même temps.


### Étape D — Critique par l'agent

```plain text
Capture une frame à chaque beat et 0,3 s après. Fais une contact sheet. Note chaque plan /10 sur : lisibilité, rythme, continuité de forme, branding, boucle. Corrige uniquement ce qui est ≤ 7. Ne touche pas aux plans à 9+.
```

> 💡 

  **2 à 4 rounds.** C'est là que le film perd son look « IA ».


### Étape E — Render draft 540p

Rapide. Tu vérifies le rythme, pas la netteté.


### Étape F — Master

60 fps, 4 sous-frames, crf 16–18, audio -14 LUFS.


### Étape G — Recadrages

Même `seek(t)`, trois compositions : **16:9, 1:1, 9:16.** Texte en zone sûre au centre 1080×1080.


---


## Export frame-perfect (prompt à copier tel quel)

Quand la preview est bonne :

```plain text
Écris render.py

- Ajoute window.seek(t) s'il est absent. t en secondes. Mets en pause toutes les Web Animations : document.getAnimations().
- Chromium Playwright, viewport exact 1920x1080, deviceScaleFactor 1.
- Attends document.fonts.ready.
- Draft : 30 fps, 1 capture/frame, 960x540.
- Master : 60 fps, 4 sous-frames par frame sur un shutter 180°, blend.
- Après chaque seek : 2 requestAnimationFrame, puis screenshot PNG RGB (pas RGBA).
- ffmpeg :
  draft : libx264 crf 23 veryfast yuv420p
  master : libx264 crf 18 -preset slow yuv420p -movflags +faststart
- Si audio.wav existe : mux AAC 256k, -t = durée exacte, loudnorm -14 LUFS.
- Vérifie la boucle : pixelmatch frame 0 vs dernière. Si ΔE visible, corrige seek.

Commande unique : python render.py --draft puis python render.py --master
Explique avant d'installer quoi que ce soit.
```

> 💡 

  **Master qualité studio** souvent vu dans les prompts publics : 4 sous-frames, `tmix`, crf 10–18, SwiftShader si WebGL.


---


## Moteurs déjà câblés

> 💡 

  **howseen-ai**

  HTML + Playwright packagé

  [claude-motion-design](https://github.com/howseen-ai/claude-motion-design)

> 💡 

  **QasimTalkin**

  Studio prêt à l'emploi

  [Ai-Motion-Studio-](https://github.com/QasimTalkin/Ai-Motion-Studio-)

> 💡 

  **Kimeur**

  Launch kinetic, 8 styles

  [motion-launch-videos](https://github.com/Kimeur/motion-launch-videos)

**Quick start studio :**

```bash
git clone https://github.com/QasimTalkin/Ai-Motion-Studio-.git
cd Ai-Motion-Studio-
npm install
npm run demo
```

> Leur phrase : le prompt, c'est 10 %. Le harness, 90 %.

**HyperFrames (Route B) :**

```bash
npx skills add heygen-com/hyperframes
npx hyperframes preview
npx hyperframes render
```


---


## Le son (sinon, ça reste un GIF cher)

| Niveau | Approche |
|---|---|
| **1 · Silence + SFX en code** | Clics, whoosh, tick placés sur le pic mesuré de l'événement |
| **2 · Piste Mixkit / libre** | BPM mesuré avec numpy, événements quantifiés sur la grille |
| **3 · VO ElevenLabs** | Voix off + sous-titres karaoké (Route B / skills) |

**Instructions à donner :**

```plain text
Analyse la piste, grille de beats, chaque SFX placé sur son pic réel, master -14 LUFS, true peak -1 dBTP. Le drop visuel = le drop audio. Pas de whoosh de stock posé « à peu près ».
```


---


## Branding : 12 règles pour tuer le look « motion IA »

1. **Un accent. Un seul.**
1. Tes vrais mots.
1. Tes vrais chiffres, sourcés.
1. Ton SVG, pas un logo redessiné.
1. Nomme un style existant, ne décris pas « premium moderne ».
1. Des états, pas une vibe.
1. **Une seule chose bouge.**
1. Springs, damping ≥ 0.72.
1. Jamais de particules / chrome lumineux / arc-en-ciel.
1. Typo assez grosse pour un téléphone.
1. Zone sûre 9:16 dès le storyboard.
1. L'agent se note et se corrige.
> 💡 

  **Test humain :** montre la boucle SANS SON.

  S'il la résume en une phrase (« le bouton est devenu un player ») → c'est bon.

  S'il hésite → trop de choses bougent.

  → [ericdjav.com](https://www.ericdjav.com/forms/motion-design-opus)


---


## Tes 10 premières minutes (chrono)

| Temps | Action |
|---|---|
| **00:00** | Dossier + `claude --model claude-opus-5-5` |
| **00:01** | `/effort max` |
| **00:02** | `CLAUDE.md` et `brand/logo.svg` |
| **00:04** | Prompt 2 (brandé) ou brief de réalisateur |
| **00:07** | Beats validés |
| **00:09** | `index.html` ouvert dans Chrome |
| **00:10** | Test « une phrase » |

> 💡 

  **Si c'est à 70 % :** fond #0B0B0B, un seul accent #E85D04, springs, logo SVG sur 13–15 s, interdits de `CLAUDE.md`. Recapture 8 frames. Corrige tout ce qui est sous 8.

**Temps réels observés sur X :** 13 min (draft propre) · 15 min (son inclus) · 40 min (Livera max + SFX) · 50 min (lancement produit). Le master propre, c'est encore 20–40 min de rounds.


---


## Skills à installer quand tu sors du one-shot

| Usage | Ressource |
|---|---|
| **B-roll sur une VO existante** | [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) · `npx skills add Barty-Bart/motion-graphics` puis `/motion-broll` |
| **HTML + Playwright packagé** | [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) |
| **Launch kinetic, 8 styles** | [Kimeur/motion-launch-videos](https://github.com/Kimeur/motion-launch-videos) |
| **Directeur JS complet** | [klsoen/opus-js-animations](https://github.com/klsoen/opus-js-animations) |
| **Index de 17 skills vidéo** | [ismoshushi/awesome-opus-video-skills](https://github.com/ismoshushi/awesome-opus-video-skills) |
| **/brag** (lit ton site, planifie, rend en HyperFrames) | GitHub latent-spaces/brag — [démo Jack Roberts](https://www.youtube.com/watch?v=XFt1DyasjOc) |
| **389 prompts + remakes** | [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) |


---


## 𝕏 Bibliothèque X (les posts de référence)

> 💡 

  **Stephan Livera** · 24 sept.

  Le showreel originel (~2M vues). Un prompt, effort max.

  [Voir le post →](https://x.com/stephanlivera/status/2103315922098470926)

> 💡 

  **@twoclipping** · 26 sept.

  UI morph / vidéo de lancement 100 % code, 0 $, zéro outil externe.

  [Voir le post →](https://x.com/twoclipping/status/2103835273813496100)

> 💡 

  **@notdwd** · 27 sept.

  Landing reveal open source, son + motion, 15 min.

  [Voir le post →](https://x.com/notdwd/status/2104138101102621133)

> 💡 

  **@socialwithaayan** · 28 sept.

  Les 7 étapes sans After Effects + guide lancement produit.

  [Voir le post →](https://x.com/socialwithaayan/status/2104592545892446671)

> 💡 

  **@adriankuleszo** · 28 sept. — Designé dans Figma, animé avec Opus 5.5. Statique → motion → prototype → prod devient un seul workflow continu.

  [Voir le post →](https://x.com/adriankuleszo/status/2104549215452205248)


---


## Process en vidéo (YouTube)


### Bart — B-roll motion graphics

[video:  https://www.youtube.com/watch?v=6Ij9-f2T2Ck]


### Moritz — 5 cas d'usage

[video:  https://www.youtube.com/watch?v=GRJzBxgKHDo]


### Jack Roberts — Claude Design

[video:  https://www.youtube.com/watch?v=HOXrLsVqinY]


### Jack Roberts — démo /brag

[video:  https://www.youtube.com/watch?v=XFt1DyasjOc]


---


## Diagnostic : quand c'est moche

| Symptôme | Cause → remède |
|---|---|
| Toujours le même film que tout X | Tu as collé le prompt Livera sans charte ni états. |
| Texte flou / logo délavé | Tu es passé par un modèle vidéo pixel. Reviens au code. |
| Ça saccade à l'export | Timers / transitions CSS. Passe en `seek(t)` pur. |
| La boucle saute | Tu matches la position mais pas la vélocité. Ajoute les queues de spring des 2 cycles précédents. |
| Ça fait cheap, ça rebondit | Easing bounce. Springs, damping 0.72+. |
| Opus invente une feature | Pas de screenshots / pas de repo / pas de `facts.md`. |
| Rendu WebGL noir | Flags SwiftShader / ANGLE au lancement de Chromium. |
| Le coût explose | Effort max sur des micro-fixes. Passe en medium pour les patchs. |


---

> 💡 

  **Tu n'as pas un générateur de vidéo.**

  Tu as un motion designer qui code, un moteur `seek(t)`, et une boucle de critique.
