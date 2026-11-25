# Ce qui marche — stats réelles et règles qui en découlent

Mise à jour : **2026-11-25**. Deux sources :
- **stats privées Windsor.ai** (TikTok Studio + YouTube Studio : rétention seconde par seconde, pays, sources de
  trafic) → `docs/stats/2026-11-25/windsor_*.csv`, procédure `docs/stats/windsor.md` ;
- stats publiques (`python3 tools/stats.py`) → `docs/stats/2026-11-25/youtube.csv`, `tiktok.csv`.

Correspondance vidéo ↔ id : `docs/stats/videos.csv`. Comptes : YouTube `@welockin-students`, TikTok `@welockin.study`,
Instagram `mystudy.skills`, Facebook `Welockin` (Instagram et Facebook : reliés ni à Windsor ni à Metricool au 25/11).

Limites : petits volumes (quelques centaines de vues), une vidéo par concept. Ce sont des tendances à confirmer, pas
des lois. Une vidéo de moins de 48 h n'est pas encore jugée (video-17, video-22 au 25/11). Les chiffres YouTube de
Windsor ont ~2 jours de retard (video-26 Mirror n'y a que 143 vues).

## Rétention (stats privées Windsor, 25/11)

### TikTok : on perd les gens dans la première seconde, et ce sont des francophones

| Vidéo | Vues | Reste à 1 s | à 2 s | à 3 s | Temps moyen | % de la durée | Vue en entier | France | FR+BE+CH+DOM |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| video-26 **Mirror** | 480 | **74 %** | **51 %** | **40 %** | **4,8 s** | **20 %** | 1,7 % | 91 % | 98 % |
| video-24 Train | 551 | 71 % | 43 % | 30 % | 3,9 s | 17 % | 0,7 % | 68 % | 81 % |
| video-30 Zoo | 584 | 68 % | 42 % | 30 % | 4,3 s | 18 % | 1,6 % | 70 % | 93 % |
| video-20 Fetch | 603 | 66 % | 42 % | 32 % | 3,8 s | 16 % | 0,9 % | 70 % | 95 % |
| video-17 Class of… | 538 | 64 % | 37 % | 29 % | 4,4 s | 19 % | 0,9 % | – | – |
| video-23 Transformation | 589 | 63 % | 37 % | 27 % | 3,7 s | 15 % | 0,8 % | 81 % | 96 % |
| video-9 Surgeon | 610 | 61 % | 39 % | 28 % | 3,4 s | 16 % | 1,7 % | 73 % | 91 % |
| video-28 Desert island | 497 | 60 % | 32 % | 18 % | 2,9 s | 12 % | 1,3 % | 79 % | 96 % |
| video-10 Lifeguard | 608 | 59 % | 41 % | 31 % | 3,8 s | 17 % | 1,7 % | 69 % | 94 % |
| video-18 1% | 530 | 56 % | 36 % | 27 % | 3,2 s | 14 % | 0,2 % | 79 % | 91 % |
| video-25 Elevator | 481 | 56 % | 32 % | 26 % | 3,8 s | 15 % | 0,6 % | 85 % | 96 % |
| video-8 Pilot | 582 | 54 % | 35 % | 24 % | 2,6 s | 12 % | 0,8 % | 63 % | 95 % |
| Codex mine (EN) | 271 | 53 % | 27 % | 24 % | 3,1 s | 18 % | **3,5 %** | 24 % | 49 % |
| video-3 Park | 688 | 51 % | 26 % | 17 % | 2,9 s | 10 % | 0,7 % | 62 % | 88 % |
| video-4 Christmas | 606 | 51 % | 23 % | 16 % | 2,4 s | 8 % | 0,3 % | 65 % | 92 % |
| Codex bedroom | 708 | 51 % | 22 % | 16 % | 3,1 s | 8 % | 0,8 % | 66 % | 89 % |
| Codex station | 723 | 51 % | 18 % | 12 % | 3,2 s | 9 % | 1,3 % | 34 % | 84 % |
| video-1 Crosswalk | 702 | 43 % | 16 % | 10 % | 1,7 s | 10 % | 0,5 % | 26 % | 64 % |
| Codex « Même nuit » (FR) | **5 831** | 40 % | 17 % | 12 % | 1,6 s | 8 % | 0,3 % | 1 % | 49 % |
| Codex « 2 minutes » (FR) | 794 | 39 % | 24 % | 18 % | 2,1 s | 10 % | 0,5 % | 63 % | 92 % |

1. **Le public TikTok est francophone.** Sur les vidéos pixel, 80 à 98 % des spectateurs sont en France, Belgique,
   Suisse ou DOM (France seule : 63–91 %), et la part augmente de vidéo en vidéo (Crosswalk 26 % de France, Mirror
   91 %). 98–99 % des vues viennent du « For You », il n'y a pas d'abonnés qui regardent. **On montre des vidéos en
   anglais à des Français.** YouTube, à l'inverse, est international et anglophone (Malaisie, Canada, Indonésie,
   Suisse, Allemagne, États-Unis, Philippines, Royaume-Uni… France : 2 % des vues, `windsor_youtube_countries.csv`).
2. **On perd la moitié des gens dans la première seconde, les deux tiers en deux secondes.** Temps moyen : 1,6 à 4,8 s
   pour des vidéos de 17 à 60 s (4 à 20 % de la durée) ; vues en entier : 0,2 à 3,5 %. C'est pour ça qu'aucune vidéo ne
   sort du premier lot de ~500 vues. Le problème TikTok est la frame 0, le son de la première seconde et la langue,
   pas l'histoire.
3. **Les règles du 25/11 marchent déjà** : les dernières vidéos pixel (Mirror, Train, Zoo, Fetch, Class of) gardent
   64–74 % des gens à 1 s et 37–51 % à 2 s, contre 43–51 % et 16–26 % pour les premières (Crosswalk, Park, Christmas,
   station). **Mirror est la meilleure sur tout** : un visage, un téléphone et un miroir qui bouge, lisibles tout de
   suite.
4. **La vidéo FR à 5 831 vues retient le moins bien** (40 % à 1 s, 1,6 s en moyenne) et TikTok l'a montrée surtout en
   Belgique, Allemagne et Pays-Bas (France 1 %). Elle a été poussée par son taux de likes (8,1 %), pas par la
   rétention. Ça ne contredit pas le point 1, mais un seul cas ne fait pas une règle.
5. **Partages et commentaires** : une seule vidéo en a (Codex « closer », EN, 17 s : 19 partages, 4 commentaires, et
   le meilleur taux de vue complète, 3,5 %). Toutes les autres : 0 ou 1.

### YouTube : on tient le hook, on perd au début du milieu

| Vidéo | Vues | Vues engagées | Durée moyenne vue | Retenue vs Shorts de même durée |
|---|---:|---:|---:|---:|
| video-28 Desert island | 360 | 68 | **91 %** | – |
| video-9 **Surgeon** | 1 237 | 555 | **77 %** | ~0,50 (moyenne) |
| Codex mine (EN) | 1 161 | 566 | 76 % | – |
| video-21 Final call | 223 | 61 | 76 % | – |
| video-1 Crosswalk | 1 003 | 362 | 71 % | – |
| video-10 Lifeguard | 991 | 456 | 67 % | – |
| video-8 Pilot | 517 | 162 | 64 % | 0,33–0,55 |
| video-3 Park | 1 216 | 309 | 60 % | – |
| video-30 Zoo | 493 | 144 | 59 % | – |
| video-23 Transformation | 529 | 195 | 59 % | – |
| video-20 Fetch | 1 224 | 553 | 58 % | 0,22–0,50 |
| video-18 1% | 1 273 | **705** | 55 % | 0,16–0,44 |
| video-25 Elevator | 620 | 234 | 54 % | – |
| video-4 Christmas | 872 | 314 | 52 % | – |
| video-29 Overdue | 438 | 146 | 50 % | – |
| video-24 Train | 1 152 | 352 | 50 % | 0,19–0,32 |
| video-26 Mirror (2 jours de retard) | 143 | 86 | 45 % | – |

6. **YouTube retient 3 à 5 fois mieux que TikTok** (50–91 % de la durée contre 4–20 %), avec le même film. Le format
   n'est pas en cause ; le public et la langue le sont.
7. **Surgeon est la seule à avoir à la fois beaucoup de vues et une rétention haute** (77 %, et 48 % des gens encore
   là à la fin, relectures comprises). 1%, Fetch et Train ont eu autant de vues grâce au sujet, mais perdent la moitié
   des gens au milieu (rétention sous la moyenne des Shorts de même durée).
8. **La falaise est entre 20 et 30 % de la durée (≈ 4,5–7 s)** sur les 5 courbes tirées : Train 0,96 → 0,66,
   1% 0,99 → 0,70, Fetch 1,00 → 0,76, Pilot 1,10 → 0,81, Surgeon 1,40 → 1,09. C'est juste après la sortie du texte de
   hook (`capOut` 3,2–3,5 s), quand rien de nouveau n'arrive avant 5 à 9 s (Surgeon : alarme à 8,9 s ; 1% : batterie
   faible à 8,4 s ; Fetch : premier saut de temps à 6,0 s).
9. **La carte de fin dure ~4 s, soit 18 % du film**, et la courbe continue de baisser pendant (Train 0,21 → 0,05).
   Hypothèse à tester : une carte de 2,5–3 s.

## Vues publiques (25/11/2026)

| Vidéo | Concept | YouTube vues | YT likes | TikTok vues | TT likes | TT % likes |
|---|---|---:|---:|---:|---:|---:|
| video-18 **1%** | la batterie meurt, ruines, il a 80 ans | **1 271** | 18 | 530 | 21 | 4,0 |
| video-9 **Surgeon** | chirurgien sur son téléphone, patient au bloc | **1 235** | 15 | 610 | 23 | 3,8 |
| video-20 **Fetch** | le chien attend toute sa vie | **1 224** | 18 | 603 | 34 | **5,6** |
| video-3 Park | la vie de ses amis passe | ~1 200 | – | 688 | 11 | 1,6 |
| video-24 **Train** | elle était en face, le match arrive après | **1 143** | 8 | 551 | 14 | 2,5 |
| Codex mine (EN) | « You're closer than you think » | ~1 100 | – | 271 | 7 | 2,6 |
| video-1 Crosswalk | traverser en scrollant | ~1 000 | – | 702 | 4 | 0,6 |
| video-10 **Lifeguard** | le maître-nageur scrolle, la nageuse filme | 984 | **24** | 607 | 32 | 5,3 |
| video-26 **Mirror** | le reflet vit sa vie | 967 (32 h) | 18 | 480 | 28 | **5,8** |
| video-22 Take a break? | rappel screen time, squelette | 924 (14 h) | 14 | – | – | – |
| video-4 Christmas | dîners de Noël, chaises vides | 872 | – | 606 | 17 | 2,8 |
| Codex station | le train de 8 h 15 | 628 | – | 723 | 5 | 0,7 |
| video-25 Elevator | étages = années (libellés) | 618 | 5 | 481 | 13 | 2,7 |
| video-23 Transformation | salle de sport, compteur DAY | 529 | 10 | 589 | 22 | 3,7 |
| video-30 Zoo | pancarte HOMO SCROLLUS | 518 | 6 | 584 | 7 | 1,2 |
| video-8 Pilot | les pilotes scrollent | 517 | 7 | 582 | 23 | 4,0 |
| video-29 Overdue | livre rendu 40 ans en retard | 502 | 8 | – | – | – |
| Codex bedroom | 20:00 → 03:00 au lit | 459 | – | 708 | 11 | 1,6 |
| video-28 Desert island | le bateau repart | 364 | 3 | 497 | 17 | 3,4 |
| video-21 **Final call** | tableau des départs (texte) | **248** | 3 | – | – | – |
| Codex mine (FR) « Même nuit. Deux trajectoires » | scroller vs creuser, en français | – | – | **5 830** | **472** | **8,1** |
| Codex « Ton juste 2 minutes » (FR) | | – | – | 794 | 16 | 2,0 |
| Fondateur « I have ADHD… » (60 s) | | – | – | 719 | 32 | 4,5 |

Historique (20/11) : le pixel 2.5D écrase le motion design plat (48 vues contre 400–1 000) ; Noël (répétition lente)
était la plus faible des histoires pixel.

## Ce que disent les chiffres

1. **TikTok plafonne : toutes les vidéos pixel en anglais restent entre 480 et 720 vues.** C'est le premier lot de
   test de TikTok ; aucune n'est passée au palier suivant, et la tendance baisse (≈ 700 le 18–19/11, ≈ 500 le 24–25/11).
2. **La seule vidéo qui a percé sur TikTok est en français** (5 830 vues, 8,1 % de likes). Le même concept en anglais a
   fait 271 vues. Les stats privées le confirment : le public TikTok est francophone à 80–98 % (section Rétention,
   point 1). → **Test proposé au client** : texte à l'écran, voix et légende en français sur TikTok, anglais ailleurs
   (la règle « vidéos en anglais » reste tant que le client ne dit pas autre chose).
3. **YouTube distribue plus loin (250 → 1 270) : c'est là qu'on voit ce qui marche.** En tête : 1%, Surgeon, Fetch,
   Park, Train, Crosswalk. En bas : Final call, Desert island, Zoo, Pilot, Overdue, Transformation, Elevator.
4. **Ce qu'ont les gagnants** : un **être vivant en jeu dans l'image** (un patient, un chien, une fille, une nageuse,
   lui-même vieilli) et une **révélation par l'image** (le vieil homme, le panier vide, le siège vide, le miroir vide).
5. **Ce qu'ont les perdants** : l'idée passe par **du texte ou des étiquettes** (tableau des départs, numéros d'étage,
   pancarte, compteur DAY), ou l'enjeu est **petit ou lointain** (un bateau à l'horizon, un avion vu de l'extérieur).
6. **Même format, même jour** : Surgeon 1 235 contre Pilot 517. À la frame 0, Surgeon montre le patient sur la table
   ET le chirurgien sur son téléphone. Pilot montre l'avion de l'extérieur : on ne voit le téléphone qu'à 2,4 s.
7. **Taux de likes (TikTok)** : Mirror 5,8 %, Fetch 5,6 %, Lifeguard 5,3 % en tête ; Crosswalk 0,6 %, Station 0,7 %,
   Zoo 1,2 % en bas. L'émotion (un chien, soi-même) et la twist surréaliste font réagir ; le gag d'étiquette, non.
8. **Commentaires ≈ 0 partout** : les questions des légendes (« Which floor are you on? ») ne font pas commenter.
9. **Couvertures** : YouTube a pris la carte de fin (logo) comme miniature pour ~10 Shorts sur 21. Sans effet visible
   dans le fil Shorts, mais la chaîne ressemble à un mur de pubs.

## Règles (à appliquer à chaque nouveau script)

- **Langue par plateforme (proposé au client le 25/11, en attente de sa réponse)** : TikTok en français (texte à
  l'écran, voix, sous-titres, légende), YouTube en anglais ; Instagram et Facebook à décider quand on aura leurs pays.
  Tant que le client n'a pas dit oui, la règle « vidéos en anglais » de `AGENTS.md` tient.
- **Frame 0 = le téléphone ET la victime/l'enjeu dans la même image**, plus le hook écrit. Pas de plan d'ambiance
  d'abord. Un visage proche et lisible (Mirror) tient mieux qu'un plan large. Objectif mesuré : **≥ 75 % des gens
  encore là à 1 s et ≥ 55 % à 2 s** sur TikTok (meilleur actuel : 74 % / 51 %).
- **Pas de creux après le hook** : quand le texte de hook sort (~3,5 s), un nouvel état visible doit arriver avant
  **5 s**, puis un changement au moins toutes les 2 s jusqu'à la révélation. La falaise YouTube est à 4,5–7 s.
- **Un être vivant à perdre** : quelqu'un en danger, quelqu'un qui attend (chien, fille, famille), ou lui-même qui
  vieillit. Les concepts « objet » ou « système » (tableau, ascenseur, salle de sport) font moins de vues sur YouTube.
- **La révélation se voit, elle ne se lit pas** : un changement d'image (vieilli, vide, parti). Le texte (tableau,
  pancarte, étiquettes) ne doit jamais porter l'idée seul.
- **Émotion ou twist surréaliste > gag** (Mirror, Fetch, Lifeguard > Zoo, Overdue, World record à confirmer).
- **Durée 20–25 s** (aucune différence visible dans cette fourchette ; rien de plus long).
- **Carte de fin (test)** : 2,5–3 s au lieu de ~4 s (le minimum de `AGENTS.md` §7 reste 2 s).
- **Légende** : une question fermée ou un aveu (« Tag the friend who… », « Be honest: yes or no? ») plutôt qu'une
  question ouverte ; épingler un commentaire.
- **Cover** : régler à la main la miniature sur le poster (frame 0) sur chaque plateforme.
- **Cadence (hypothèse à tester)** : 1 vidéo par jour et par plateforme plutôt que 3–4 ; les vues TikTok baissent depuis
  qu'on publie plusieurs vidéos par jour.
- **Mesurer chaque vidéo à 48 h** (Windsor) : TikTok `ret_1s`, `ret_2s`, `avg_watch_ratio` ; YouTube `avg_view_pct` et
  la courbe. Une règle ne change que si deux vidéos au moins vont dans le même sens.

## Ce qu'il faudrait au client pour aller plus loin

- **Relier Instagram (`mystudy.skills`) et la page Facebook (`Welockin`) à Windsor.ai** (liens donnés au client le
  25/11 ; procédure dans `docs/stats/windsor.md`). Sans ça, on ne sait rien de ces deux plateformes.
- L'essai Windsor ne garde que 30 jours : faire le relevé au moins une fois par mois, ou passer à un plan payant pour
  l'historique.
