@AGENTS.md

## Spécifique à Claude Code

- Skills du projet : `lemo-opuscar` (réalisation/production) et `tiktok-marketing` (hook, audit du script, description).
  Les invoquer avec l'outil Skill quand une vidéo commence ; les sous-skills TikTok se lisent dans
  `.claude/skills/tiktok-marketing/skills/<tt-nom>/SKILL.md`.
- Au début d'une session : `sh tools/setup.sh` (rapide si déjà fait), puis `. tools/env.sh` dans chaque commande Bash
  qui lance un outil de rendu (l'état du shell ne persiste pas entre deux appels).
- Agent : se déclarer `claude` dans `tools/new-video.sh`.
- Livraison : envoyer `output/video-N_vK.mp4` et `output/video-N_vK_tiktok.md` avec `SendUserFile`, et coller la
  description dans la réponse, prête à copier.
- Les rendus longs (master 60 fps) se lancent en arrière-plan ; ne pas faire de `sleep` pour les attendre.
- Effort : nouvelle vidéo = effort élevé ; petites corrections et re-rendus = effort moyen (playbook).
