# Metricool : les stats privées (rétention) des 4 plateformes

> Depuis le 26/11/2026, le client a relié à Metricool (marque « Welockin », blogId 8360223) : TikTok `study_lock.in`,
> la page Facebook, Instagram `welock.in` et YouTube `@welockin-students`. C'est la source des stats de ces comptes
> (Windsor ne connaît que l'ancien TikTok @welockin.study et YouTube). Analyse quotidienne : `docs/analyse.md`.

Connecteur claude.ai **Metricool Social Media Management** (outils `mcp__Metricool_Social_Media_Management__*`).
Il lit les vraies statistiques des comptes une fois ceux-ci reliés dans Metricool (app.metricool.com → Brand →
Connections : Instagram `mystudy.skills`, Facebook `Welockin`, TikTok `@welockin.study`, YouTube `@welockin-students`).
Sans réseau relié, `getBrandSettings` répond « This brand doesn't have any social network connected yet ».

## Procédure (étape 3b de `AGENTS.md`)

1. `getBrandSettings` → `brandId` et fuseau horaire de la marque.
2. `getAnalyticsDataByMetrics(brandId, from, to, metrics)` par réseau, sur les 30 derniers jours (un appel par
   connecteur ; ne pas mélanger les connecteurs dans un même appel).
3. Écrire le résultat dans `docs/stats/<date>/metricool_<réseau>.csv` (une ligne par vidéo), relier chaque vidéo à son
   dossier dans `docs/stats/videos.csv` (colonnes `instagram_id`, `facebook_id` si besoin), puis mettre à jour
   `docs/performance-notes.md`.
4. `getBestTimeToPostByNetwork` (une semaine max) pour conseiller l'heure de publication dans la description.

## Les métriques à tirer (ID Metricool)

La rétention compte plus que les vues : c'est elle qui décide si la plateforme pousse la vidéo au palier suivant.

| Réseau | Connecteur | Identité | Rétention (le plus important) | Réaction |
|---|---|---|---|---|
| Instagram | `reels` | IGRE02 date, IGRE03 texte, IGRE06 url | **IGRE27 retention (% moyen vu)**, **IGRE30 skip rate (< 3 s)**, IGRE28 view rate (> 3 s), IGRE24 temps moyen | IGRE23 views, IGRE11 reach, IGRE10 likes, IGRE12 saved, IGRE21 shares, IGRE07 comments |
| Facebook | `reels` | FBRE02 date, FBRE05 texte, FBRE06 url | **FBRE13 temps moyen regardé**, FBRE12 temps total | FBRE10 views, FBRE11 reach, FBRE08 likes, FBRE07 actions |
| TikTok | `posts` | TKPO02 date, TKPO05 description, TKPO03 url, TKPO06 durée | **TKPO13 % vus en entier**, **TKPO15 temps moyen**, **TKPO16 part « For You »** (TKPO17 follow, TKPO21 search) | TKPO07 views, TKPO11 reach, TKPO08 likes, TKPO10 shares, TKPO09 comments |
| YouTube | `videos published in range` | YTVP02 date, YTVP17 titre, YTVP04 id | **YTVP08 durée moyenne de visionnage** | YTVP06 views, YTVP09 likes, YTVP12 shares, YTVP11 comments |

(`IGRE13`, `IGRE15` et tout le connecteur YouTube `videos` sont dépréciés : ne pas les utiliser.)

## Lire les chiffres

- **Skip rate (IG) / % vus en entier (TikTok)** : juge la frame 0 et les 3 premières secondes. Un skip élevé = le hook
  ne se lit pas assez vite (revoir la règle « frame 0 = téléphone + enjeu »).
- **Rétention moyenne / temps moyen** rapporté à la durée : où la vidéo perd les gens. Sous ~60 % sur 20–25 s, le milieu
  est trop long ou se répète.
- **Part « For You » (TikTok)** : si elle reste basse, TikTok ne pousse pas la vidéo hors du premier lot (le cas au 25/11).
- **Saves et shares** valent plus que les likes : ce sont eux qui disent qu'une vidéo touche.
