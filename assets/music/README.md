# Bibliothèque musicale

Pistes fournies par le client (liens YouTube), converties en MP3 avec le skill `youtube-audio`
(`.claude/skills/youtube-audio/`). Pour **chaque nouveau TikTok**, l'agent choisit ici la piste la plus adaptée
(méthode : `.claude/skills/youtube-audio/SKILL.md`, "Choose the track").

- Télécharger tout ce qui manque : `sh .claude/skills/youtube-audio/scripts/yt2mp3.sh --catalog`, **sur un ordinateur
  où YouTube marche** (YouTube refuse les serveurs cloud), puis commit + push de `assets/music/`
- Mesurer : `. tools/env.sh && "$LIB/.venv/bin/python" .claude/skills/youtube-audio/scripts/analyze.py`
- Les MP3, `.info.json`, `.analysis.json` et ce tableau sont commités : tous les agents et toutes les sessions y ont accès.

| # | YouTube | Titre / chaîne | Durée | BPM | Drops (s) | Ambiance | Idéal pour | Droits | Utilisée dans | Statut |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | https://www.youtube.com/watch?v=01qStKYB7ts | | | | | | | fournie par le client | | à télécharger |
| 2 | https://www.youtube.com/watch?v=4JZ-o3iAJv4 | | | | | | | fournie par le client | | à télécharger |
| 3 | https://www.youtube.com/watch?v=aQkfOkFvx2U | | | | | | | fournie par le client | | à télécharger |
| 4 | https://www.youtube.com/watch?v=Q_rAdk72b-k | | | | | | | fournie par le client | | à télécharger |
| 5 | https://www.youtube.com/watch?v=kn5HyDC8q7c | | | | | | | fournie par le client | | à télécharger |
| 6 | https://www.youtube.com/watch?v=BYGz4ttihm8 | | | | | | | fournie par le client | | à télécharger |
| 7 | https://www.youtube.com/watch?v=A9hzqHsocEA | | | | | | | fournie par le client | | à télécharger |

Liens d'origine (avec playlist / mix radio, seule la vidéo est prise) : `4JZ-o3iAJv4` venait d'un mix radio
`RD4JZ-o3iAJv4` ; `aQkfOkFvx2U`, `Q_rAdk72b-k`, `kn5HyDC8q7c`, `BYGz4ttihm8`, `A9hzqHsocEA` de la playlist
`PL1R-E0_6bE2ynFH4LgFENu9T2pkWiX4NO`. Pour ajouter une piste : une ligne de plus, puis télécharger et mesurer.
