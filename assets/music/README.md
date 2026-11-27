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
| 1 | https://www.youtube.com/watch?v=01qStKYB7ts | Stranger Things Main Theme — L'Orchestra Cinématique | 1:30 | 83 | 0:01, 0:02, 0:03 | cinématographique, sombre, pulsation régulière | Installer la tension avant le verrouillage du téléphone. | fournie par le client (droits non vérifiés) | video-5 v1, video-8–10 v1 (thème de la série), video-15 v1, video-27 v1, video-32 v1 | téléchargée |
| 2 | https://www.youtube.com/watch?v=4JZ-o3iAJv4 | Can You Hear The Music — Ludwig Goransson | 1:50 | 89 | 0:19, 0:25, 0:26 | cinématographique, ample, énergie contrastée | Accompagner une prise de conscience puis le début d'une session de travail, montée vers 0:25. | fournie par le client (droits non vérifiés) | video-3 v1, video-20 v1, video-24 v1, video-35 v1, video-40 v1 | téléchargée |
| 3 | https://www.youtube.com/watch?v=aQkfOkFvx2U | Nightcrawler (Instrumental) — fam0uz - Topic | 1:01 | 123 | 0:07, 0:08, 0:45 | instrumental, rythmé, énergie soutenue | Monter rapidement les distractions puis synchroniser le verrouillage sur la montée à 0:45. | fournie par le client (droits non vérifiés) | video-7 v1, video-17 v1, video-25 v1, video-30 v1, video-33 v1, video-39 v1 | téléchargée |
| 4 | https://www.youtube.com/watch?v=Q_rAdk72b-k | IMPXSTR - GALAXY! — I N S O M N I A 死 | 1:10 | 89 | 0:01, 0:02, 0:03 | phonk, dense, attaque immédiate | Ouvrir sur un hook percutant puis enchaîner un montage de concentration. | fournie par le client (droits non vérifiés) | video-6 v1, video-16 v1, video-23 v1, video-36 v1, video-41 v1 | téléchargée |
| 5 | https://www.youtube.com/watch?v=kn5HyDC8q7c | I'll Do It (Instrumental) — lucii. - Topic | 1:27 | 112 | 0:02, 0:17, 0:18 | instrumental, pulsé, énergie contrastée | Passer de la procrastination à l'action sur la montée vers 0:17. | fournie par le client (droits non vérifiés) | video-11 v1, video-19 v1, video-26 v1, video-34 v1, video-38 v1 | téléchargée |
| 6 | https://www.youtube.com/watch?v=BYGz4ttihm8 | you lost - Scheming (Instrumental Slowed) (song for sad edit) — Gijuri Drop | 1:12 | 86 | 0:02, 0:14, 0:15 | instrumental ralenti, triste, atmosphérique | Illustrer le temps perdu à scroller puis une reprise en main vers 0:14. | fournie par le client (droits non vérifiés) | video-2 v1, video-18 v1, video-22 v1, video-29 v1, video-31 v1 | téléchargée |
| 7 | https://www.youtube.com/watch?v=A9hzqHsocEA | Acid Rain (Slowed) — lucii. - Topic | 2:07 | 96 | 0:24, 1:13, 1:14 | ralenti, contrasté, montée tardive | Accompagner une session nocturne et placer la révélation du travail accompli vers 1:13. | fournie par le client (droits non vérifiés) | video-4 v1, video-14 v1, video-21 v1, video-28 v1, video-37 v1 | téléchargée |

Liens d'origine (avec playlist / mix radio, seule la vidéo est prise) : `4JZ-o3iAJv4` venait d'un mix radio
`RD4JZ-o3iAJv4` ; `aQkfOkFvx2U`, `Q_rAdk72b-k`, `kn5HyDC8q7c`, `BYGz4ttihm8`, `A9hzqHsocEA` de la playlist
`PL1R-E0_6bE2ynFH4LgFENu9T2pkWiX4NO`. Pour ajouter une piste : une ligne de plus, puis télécharger et mesurer.

Mesures : BPM estimés automatiquement sur les 90 premières secondes, sans correction de tempo. Les drops sont les trois plus fortes hausses d'énergie détectées, parfois adjacentes ou dans le fondu d'entrée ; ils ne garantissent pas trois drops musicaux distincts. Ambiances et usages proposés déduits des métadonnées et de l'énergie, sans écoute de validation. Les analyses donnent un RMS en dB, pas une mesure LUFS. Aucune licence n'est renseignée dans les métadonnées de ces sept pistes.
