# Analyse : évolution, impact, prochains scripts (tâches planifiées)

Demande du client le 27/11 : « des rappels ou des tâches planifiées pour analyser l'évolution, les impacts, les
prochains scripts à faire ». Deux tâches planifiées reviennent dans la session de production :

| Tâche | Quand (Europe/Zurich) | Ce qu'elle fait |
|---|---|---|
| **Analyse quotidienne** | tous les jours à 12:47 | relevé des stats, évolution de chaque vidéo, règles, backlog, 5 lignes au client |
| **Bilan de la semaine** | dimanche à 20:13 | semaine contre semaine, décisions de format et de cadence, scripts de la semaine suivante, rapport |

Les passages de publication (toutes les 3 h, `docs/posting.md`) font aussi un **relevé d'impact rapide à chaque fois**
(demande du client le 28/11 : « n'oublie pas d'analyser ton impact à chaque fois ») : Metricool sur 4 jours, la meilleure
vidéo de chaque plateforme, ce qu'elle a de différent, et le choix de la prochaine idée en conséquence.

## 1. Relever (chaque jour)

- **Metricool** (TikTok study_lock.in, Facebook, Instagram, YouTube) : `getAnalyticsDataByMetrics`, blogId 8360223,
  30 derniers jours, un appel par réseau, métriques de `docs/stats/metricool.md` → `docs/stats/<date>/metricool_<réseau>.csv`.
  Les posts publiés par Metricool : leur `publicUrl` va dans `docs/posting-log.md` et leurs ids dans `docs/stats/videos.csv`.
- **Windsor** (YouTube, rétention seconde par seconde ; ancien TikTok @welockin.study) : `docs/stats/windsor.md`,
  `date_preset: "last_29dT"`, puis `python3 tools/windsor_merge.py`.
- **Public** : `. tools/env.sh && python3 tools/stats.py`.
- Un outil en panne : le dire dans le message au client, analyser avec ce qu'on a, ne rien inventer.

## 2. Évolution (chaque jour) → `docs/stats/evolution.md`

Une ligne par vidéo publiée **et par relevé** (on ajoute, on n'écrase pas) :
`date du relevé | vidéo | plateforme | langue | créneau | âge (h) | vues | likes | commentaires | partages | saves |
% vus en entier ou rétention | temps moyen | abonnés gagnés`.

Lire à **24 h, 48 h et 7 j** (une vidéo de moins de 48 h n'est pas jugée) et comparer, toujours à âge égal :
- les formats : série « Deux trajectoires » / histoires de perte (Premiers pas, Fais un vœu) / remakes FR des vidéos anglaises ;
- les plateformes et les langues (FR TikTok-Facebook-Instagram, EN YouTube) ;
- les créneaux 08:00 / 11:00 / 14:00 / 17:00 / 20:00 / 23:00 ;
- la cadence : à 6 vidéos par jour, les vues par vidéo baissent-elles ? (règle « Cadence » de `docs/performance-notes.md`).

## 3. Impact et règles (chaque jour)

Mettre à jour `docs/performance-notes.md` : tableau, ce qui monte, ce qui baisse, abonnés gagnés par plateforme.
Une règle ne change que si **deux vidéos au moins** de plus de 48 h vont dans le même sens.

## 4. Prochains scripts (chaque jour, et en grand le dimanche)

- Réordonner `docs/backlog.md` d'après les règles (le meilleur concept en premier).
- S'il reste moins de 8 lignes « à faire », en écrire (consignes du backlog, faits de `brand/welockin/facts.md` seulement).
- Si la série fait moins bien que les histoires de perte sur 3 épisodes jugés : le dire au client et proposer autre chose.
- **Dimanche** : 7 à 10 nouvelles lignes pour la semaine suivante (titre, idée, hook écrit, la règle ou le chiffre qui la justifie).

## 5. Rendre compte

- **Chaque jour** : commit + push (`docs/stats/`, `docs/performance-notes.md`, `docs/backlog.md`) ; au client, en
  français, 5 lignes max : les chiffres du jour (meilleure vidéo, total par plateforme), ce qui marche, ce qui change
  pour les prochains scripts.
- **Dimanche** : rapport `docs/reports/<date>-semaine.md` (évolution sur la semaine, meilleure et pire vidéo et pourquoi,
  décisions, scripts de la semaine suivante), envoyé au client avec `SendUserFile` ; ne demander son accord que pour ce
  qui change sa demande (format, cadence, plateformes).
