Tu es Codex et tu travailles **en local sur le Mac du client**, dans le dépôt `video-design-ai-environnement`
(studio de vidéos TikTok pour WeLockIn). Ta mission : remplir la bibliothèque musicale du studio à partir de 7 liens
YouTube, pour que Claude et toi puissiez choisir la meilleure musique pour chaque futur TikTok.
Pourquoi toi : YouTube refuse les téléchargements depuis les serveurs cloud, donc ça doit tourner ici, sur le Mac.
Si tu tournes dans le cloud (pas sur le Mac), arrête-toi tout de suite et dis-le.

## 0. Récupérer le bon code

```bash
git fetch origin
git checkout claude/elegant-wright-siahu5
git pull --ff-only origin claude/elegant-wright-siahu5
```

Le skill et le catalogue sont sur cette branche (pas encore sur `main`). Tu commiteras et pousseras **sur cette même
branche**.

## 1. Lire avant d'agir

- `AGENTS.md` (règles du studio ; §2 skills, §3 coordination, §5 étape 6 "Musique")
- `.claude/skills/youtube-audio/SKILL.md` (le skill que tu vas utiliser, aussi visible dans `.agents/skills/youtube-audio`)
- `assets/music/README.md` (le catalogue à remplir : les 7 liens y sont déjà)

## 2. Prérequis sur le Mac

- `ffmpeg` : `command -v ffmpeg || brew install ffmpeg`
- `python3` (3.9+). Le script installe `yt-dlp` tout seul dans `.tools/py` (dossier ignoré par git).
- Ne lance **pas** `sh tools/setup.sh` (il installe toute la chaîne de rendu, inutile ici).

## 3. Télécharger les 7 pistes en MP3

```bash
sh .claude/skills/youtube-audio/scripts/yt2mp3.sh --catalog
```

- Ça télécharge chaque lien du catalogue qui n'a pas encore de MP3 → `assets/music/<id>__<titre>.mp3` + `.info.json`.
- Seule la vidéo du lien est prise, même si l'URL d'origine venait d'une playlist ou d'un mix radio.
- Si une piste échoue avec "Sign in to confirm you're not a bot", une restriction d'âge ou "Video unavailable" :
  réessaie celle-là avec les cookies du navigateur du client :
  `YT_EXTRA="--cookies-from-browser chrome" sh .claude/skills/youtube-audio/scripts/yt2mp3.sh "<url>"`
  (ou `safari` / `firefox`). Si ça échoue encore, laisse la ligne "à télécharger" et note l'erreur exacte dans le rapport.
- Si yt-dlp est trop vieux pour YouTube : `PYTHONPATH=.tools/py python3 -m pip install -U --target .tools/py yt-dlp`, puis réessaie.

## 4. Mesurer les pistes

```bash
python3 -m venv .tools/venv-music
.tools/venv-music/bin/pip install --quiet numpy scipy
.tools/venv-music/bin/python .claude/skills/youtube-audio/scripts/analyze.py
```

Ça écrit `assets/music/<id>__<titre>.analysis.json` (durée, BPM, loudness, énergie toutes les 2 s, 3 plus gros drops)
et affiche un résumé. `.tools/` est ignoré par git, ne le commite pas.

## 5. Remplir le catalogue `assets/music/README.md`

Pour chaque ligne (garde les colonnes et l'ordre ; une ligne par lien, ne supprime aucun lien) :

| Colonne | Quoi mettre |
|---|---|
| Titre / chaîne | depuis le `.info.json` : `title` — `channel` |
| Durée | `m:ss` |
| BPM | celui de l'analyse (arrondi) ; s'il est manifestement doublé/divisé par 2 au vu du genre, corrige et note-le |
| Drops (s) | les drops de l'analyse, en `m:ss` |
| Ambiance | 3 à 6 mots en français, déduits du titre, de la chaîne, des tags/description du `.info.json` et de la courbe d'énergie (ex. "lo-fi calme, piano, sans drop") |
| Idéal pour | quel type de TikTok WeLockIn, en une phrase (ex. "routine d'étude / fin apaisée", "tension → impact, drop à 0:42", "hook rapide, montage nerveux") |
| Droits | `fournie par le client` + la licence du `.info.json` si elle existe (ex. "Creative Commons Attribution"), sinon `fournie par le client (droits non vérifiés)` |
| Utilisée dans | laisse vide |
| Statut | `téléchargée` (ou `à télécharger` + raison courte si échec) |

Si une piste dure plus de 15 min (mix, compilation), mets-le dans "Ambiance" ("mix 1 h, plusieurs morceaux").
N'invente rien : ce que tu ne sais pas, écris-le comme inconnu.

## 6. Vérifier

- `ls -la assets/music/` : 7 MP3 (ou moins + les échecs expliqués), chacun lisible :
  `ffprobe -v error -show_entries format=duration -of csv=p=0 <fichier.mp3>`
- Taille totale : `du -sh assets/music`. Si un MP3 dépasse 40 Mo (mix très long), garde-le mais signale-le.
- `git status` : seuls `assets/music/*` doivent apparaître (MP3, `.info.json`, `.analysis.json`, `README.md`).
  `.gitignore` laisse passer les MP3 exprès : ne le modifie pas.

## 7. Commit et push

```bash
git add assets/music
git commit -m "music: download and measure the client's 7 tracks"
git push origin claude/elegant-wright-siahu5
```

Si le push est refusé parce que la branche distante a avancé : `git pull --no-rebase origin claude/elegant-wright-siahu5`,
puis push à nouveau (pas de force-push).

## Règles

- Ne touche à rien d'autre que `assets/music/` (pas de `video/`, pas de `AGENTS.md`, pas de `tools/`). Seule exception :
  un vrai bug dans `.claude/skills/youtube-audio/scripts/`, corrigé au minimum et expliqué dans le rapport.
- Pas de vidéo à produire dans cette tâche.
- Pas de secrets dans le dépôt (pas de fichier de cookies, rien de `~/Library`).

## Rapport final (en français, court)

Un tableau : # · titre · durée · BPM · ambiance · idéal pour · statut. Puis les échecs éventuels avec l'erreur exacte, la
taille totale de `assets/music/`, et le hash du commit poussé.
