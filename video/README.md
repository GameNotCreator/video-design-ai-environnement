# Vidéos

Une vidéo = un dossier `video-N/`. Chaque dossier contient un fichier `CLAIM` qui dit quel agent (Claude Code ou Codex)
l'a créé ; on ne travaille que dans ses propres dossiers.

- Nouveau numéro : `sh tools/new-video.sh <claude|codex> "<titre court>"`, puis commit + push du `CLAIM` tout de suite.
- Les livrables (MP4 compressé TikTok + description) sont dans `video-N/output/` : `video-N_vK.mp4` et
  `video-N_vK_tiktok.md`, une paire par version.

Règles complètes : `/AGENTS.md`.
