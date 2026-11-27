# Publication automatique (Metricool)

Le client a demandé le 26/11 : « faire des posts tous les jours, régulièrement, de manière automatique ».
Une tâche programmée (6 fois par jour) produit et programme une vidéo à chaque passage ; le client peut annuler un post dans le
planificateur Metricool avant son heure (lien `plannerUrl` donné à chaque fois).

## Comptes (marque Metricool « Welockin », blogId 8360223, fuseau Europe/Zurich)

| Réseau | Compte | On publie ? |
|---|---|---|
| TikTok | study_lock.in | oui, en français |
| Facebook | page 1426570190546010 | oui, en Reel, en français |
| YouTube | @welockin-students (UCESYUmes8WTPj_a0-2hPmYw) | oui, en Short, **en anglais** (public anglophone) |
| Instagram | welock.in | oui, en Reel, en français (autorisé par le client le 26/11) |
| comptes perso (TikTok « Hedi Fourati », Threads), LinkedIn | — | **jamais** sans demande explicite |

## Rythme (demandes du client le 26/11 : « 4 vidéos par jour », puis « pas assez » et « un à 8 h du matin puis
3 heures entre chaque vidéo »)

- **6 vidéos par jour et par plateforme**, toutes les 3 h : **08:00, 11:00, 14:00, 17:00, 20:00, 23:00**
  (Europe/Zurich). La même vidéo part en français sur TikTok + Facebook Reel + Instagram Reel et, si elle a une version
  anglaise, en YouTube Short au même créneau.
- La tâche programmée tourne 6 fois par jour (02:36, 06:36, 10:36, 14:36, 18:36, 22:36) ; chaque passage produit
  **une** vidéo et la place sur le **premier créneau libre qui commence au moins 3 h plus tard**.
- Les stats et l'analyse (évolution, impact, prochains scripts) ne se font pas aux passages de publication : tâches
  « Analyse quotidienne » (12:47) et « Bilan de la semaine » (dimanche 20:13), procédure dans `docs/analyse.md`.
- Pour remplir vite : les versions françaises des meilleures vidéos anglaises (`?lang=fr`,
  `tools/videotpl/render_lang.sh N K fr`) partent sur TikTok, Facebook et Instagram seulement (l'anglais est déjà sur YouTube).

## Programmer un post (outil `createScheduledPost`)

- `media` : l'URL brute GitHub **épinglée sur le commit** (le dépôt est public ; Metricool copie le fichier) :
  `https://raw.githubusercontent.com/GameNotCreator/video-design-ai-environnement/<sha>/video/video-N/output/video-N_vK.mp4`
  (vérifier `curl -sI` → 200 avant).
- TikTok : `tiktokData` avec **`title` obligatoire** (la première ligne de la légende), `privacyOption`
  PUBLIC_TO_EVERYONE, `disableDuet`/`disableStitch` true, `commercialContentOwnBrand` true, `isAigc` false (choix par
  défaut annoncé au client), `videoCoverMilliseconds` = instant de la couverture.
- Facebook : `facebookData: {"type": "REEL"}` ; même texte que TikTok.
- Instagram : `instagramData: {"type": "REEL", "showReelOnFeed": true, "isAiGenerated": false}` ; même texte que TikTok.
- YouTube : `youtubeData: {"title", "type": "short", "privacy": "public", "madeForKids": false, "tags": [...]}`, texte
  et titre en anglais, vidéo `_en`.
- Texte : la légende et les hashtags de `output/video-N_vK_tiktok.md` (TikTok/Facebook) ou sa version anglaise (YouTube).
- Après chaque programmation : noter l'id et le `plannerUrl` dans `docs/posting-log.md`.

## Vérifier

`getScheduledPosts` (3 jours) avant de produire : ne pas doubler un créneau. Un post publié y reste avec `status:
PUBLISHED` et son `publicUrl` (le noter dans le journal). Stats : le TikTok **study_lock.in** et la page Facebook sont
lus par **Metricool** (`docs/stats/metricool.md`) ; Windsor ne connaît que l'ancien TikTok @welockin.study et YouTube.
