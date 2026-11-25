# Windsor.ai : les stats privées (rétention seconde par seconde)

Connecteur claude.ai **Windsor.ai for Social Media** (outils `mcp__Windsor_ai_for_Social_Media__*`). C'est la source
principale depuis le 25/11/2026 : il lit TikTok Studio et YouTube Studio, rétention comprise.

| Réseau | Connecteur | Compte | État (25/11) |
|---|---|---|---|
| TikTok | `tiktok_organic` | `welock.instudy` (id `_0001Czq5ayQwdQnzN0GoKxv1KktBsLnOvbY`) | relié |
| YouTube | `youtube` | chaîne `@welockin-students` | relié (données en retard de ~2 jours) |
| Instagram | `instagram` | `mystudy.skills` | **pas relié** |
| Facebook | `facebook_organic` | page `Welockin` | **pas relié** |

Pour relier Instagram ou Facebook : `get_connector_connect_info(connector)` donne le lien à ouvrir par le client.

**Limite de l'essai Windsor : 30 jours d'historique.** Toujours demander `date_preset: "last_29dT"` (ou une plage
`date_from`/`date_to` de moins de 30 jours). Une plage plus longue renvoie une erreur. Sur TikTok, la plage filtre sur
la **date de publication** de la vidéo : une vidéo publiée il y a plus de 30 jours n'apparaît plus.

## Procédure (étape 3b de `AGENTS.md`)

1. `get_connectors` → vérifier les comptes reliés.
2. Tirer les 7 jeux de données ci-dessous (`get_data`, un appel chacun, ils peuvent partir en parallèle).
3. Copier chaque réponse JSON (ou le fichier où l'outil l'a sauvée si elle est trop longue) dans un dossier du
   scratchpad, sous le nom de la colonne « fichier » : `tt_videos.json`, `tt_retention.json`, etc.
4. `python3 tools/windsor_merge.py <dossier> <date>` → `docs/stats/<date>/windsor_tiktok.csv` (une ligne par vidéo :
   rétention à 1/2/3/5 s, part « For You », part francophone), `windsor_tiktok_retention.csv`,
   `windsor_youtube.csv`, `windsor_youtube_retention.csv`, `windsor_youtube_countries.csv`. Les dossiers vidéo viennent
   de `docs/stats/videos.csv` (y ajouter d'abord les vidéos publiées depuis).
5. Mettre à jour `docs/performance-notes.md` (tableau rétention, ce qui change, règles).

| Fichier | Connecteur | `fields` |
|---|---|---|
| `tt_videos` | `tiktok_organic` | `video_id, video_create_datetime, video_caption, video_duration, video_views_count, video_reach, video_average_time_watched, video_full_watched_rate, video_likes, video_shares, video_favorites, video_comments, video_new_followers, video_profile_views` |
| `tt_retention` | `tiktok_organic` | `video_id, video_view_retention_second, video_view_retention_percentage` |
| `tt_sources` | `tiktok_organic` | `video_id, video_impression_sources_impression_source, video_impression_sources_percentage` |
| `tt_countries` | `tiktok_organic` | `video_id, video_audience_countries_country, video_audience_countries_percentage` |
| `yt_videos` | `youtube` | `video, video_title, published_at, views, engaged_views, average_view_duration, average_view_percentage, likes, shares, comments, subscribers_gained` |
| `yt_retention` | `youtube` | `video, elapsed_video_time_ratio, audience_watch_ratio, relative_retention_performance` + `filters: [["video","in","[\"id1\",\"id2\"]"]]` (5 vidéos max par appel, sinon la réponse est trop longue) |
| `yt_countries` | `youtube` | `country, views, engaged_views` |

Pour TikTok, passer `accounts: ["_0001Czq5ayQwdQnzN0GoKxv1KktBsLnOvbY"]` (l'autre compte TikTok relié est le compte
personnel du fondateur). Dans `reasoning`, une raison courte sans nom ni identifiant.

Autres champs utiles : `video_audience_types_type/percentage` (nouveaux spectateurs vs abonnés),
`video_engagement_likes_second/percentage` (seconde où tombent les likes), `comment_text` (commentaires), et pour
YouTube `traffic_source`, `subscribed_status`, `viewer_age_group`.

Lecture seule : Windsor sait aussi publier et répondre aux commentaires (`execute_action`) ; on ne s'en sert pas sans
demande explicite du client.

## Lire les chiffres

- **TikTok `ret_1s`, `ret_2s`** : la part qui regarde encore après 1 et 2 secondes. Ces chiffres jugent la frame 0 et le
  hook. Au 25/11, le meilleur est 74 % / 51 % (video-26 Mirror) ; viser ≥ 75 % / ≥ 55 %.
- **TikTok `avg_watch_ratio`** : temps moyen divisé par la durée. Au 25/11 : 4 à 20 %. Tant qu'il reste sous ~30 %,
  TikTok ne sort pas la vidéo du premier lot (~500 vues).
- **TikTok `francophone_share`** : FR + BE + CH + LU + DOM. Au 25/11 : 80–98 % sur les vidéos pixel.
- **YouTube `avg_view_pct`** : 45–91 % ; `engaged_views` (vues au-delà des premières secondes) est la mesure comparable
  d'une vidéo à l'autre, car `views` compte les relectures des Shorts.
- **YouTube `audience_watch_ratio`** par tranche de durée : où les gens partent. Plus de 1 = relectures.
  `relative_retention` compare à des Shorts de même durée (0,5 = moyenne).
