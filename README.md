# WeLockIn video studio

Vidéos TikTok pour [WeLockIn](https://welock.in), faites en code par des agents (Claude Code, Codex), dans le style
2.5D Pixel Art de [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar).

- Règles et pipeline : [`AGENTS.md`](AGENTS.md) (lu par Codex ; `CLAUDE.md` l'importe pour Claude Code)
- Vidéos : [`video/`](video/), une par dossier `video-N/`, livrables dans `video-N/output/`
- Marque : [`brand/welockin/`](brand/welockin/) (faits autorisés, palette, logo)
- Assets fournis : [`assets/`](assets/) · musiques : [`assets/music/`](assets/music/) (skill `youtube-audio`)
- Playbook motion design (source) : [`docs/playbook-motion-design-fr.md`](docs/playbook-motion-design-fr.md)

Installation : `sh tools/setup.sh`, puis `. tools/env.sh` avant les outils de rendu.

Skills installés : `lemo-opuscar` (MIT / CC BY-NC 4.0, voir `.claude/skills/lemo-opuscar/NOTICE.md`) et
[`tiktok-skills`](https://github.com/sergebulaev/tiktok-skills) (MIT) dans `.claude/skills/`, liés pour Codex dans `.agents/skills/`.
