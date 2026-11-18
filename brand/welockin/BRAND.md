# WeLockIn: brand kit for the videos

| File | What it is | Use |
|---|---|---|
| `logo-mascot.png` | 512×512, mascot in red fez peeking over the `welock.in` wordmark, cream background | end card, last 2–3 s of every video (real image, never redrawn) |
| `app-icon.png` | 180×180 app icon | small device / app-icon moments |
| `images/og-card.png` | 1200×630 social card: lock icon + wordmark + tagline + mascot | reference for wordmark and type |
| `images/peep.webp` | the mascot alone, transparent | reference for the pixel sprite of the mascot |
| `images/devices-cutout.webp` | Mac + iPhone + iPad cut-out, transparent | reference for drawing the devices as pixel props |
| `images/card-websites.webp` | site blocklist UI card | reference for the app's UI |
| `facts.md` | everything a video may claim | read before every script |

All of the above come from welock.in (the founder's own site) and may be used in WeLockIn videos.
More assets the founder sends go to `/assets/` (shared by every video) with a line in `/assets/README.md`.

## Palette (from the site's CSS and logo)

| Token | Hex | Where |
|---|---|---|
| Fez red | `#C41919` | the mascot's fez, `.in` of the wordmark: **the brand's one saturated colour** |
| Web red (UI) | `#C8402F` / dark `#A42B1B` | buttons, dots, lock icon |
| Cream paper | `#F5F0E8` (light `#FAF7F1`) | site background, logo background |
| Ink | `#1A1714` | text, outlines (warm, never pure black) |
| Warm grey | `#6F6759` | secondary text |

## Type (site)

- **Figtree** (sans, OFL): UI, headlines on the site. Use it for the URL / CTA on the end card.
- **EB Garamond** (serif, OFL): the site's serif. It is an old-style serif, so it may stand in for Cormorant in the
  2.5D Pixel Art subtitles and dialogue boxes, which ties the film to the brand. Chapter cards keep Cinzel (style rule).
- Fonts are self-hosted per film in `video/video-N/fonts/` (download from github.com/google/fonts/tree/main/ofl/…).

## Brand × 2.5D Pixel Art (hd-2d): how they meet

These follow from the style's own rules (`STYLE.md` §3, §8); the story of each video still comes from its script.

- **The hero wears the one saturated colour no set uses** (style rule) → the student hero wears the **red fez** (`#C41919`).
  Nothing else in any set is that red, so the tiny sprite is findable in every wide shot, and the brand is on screen
  from frame 1.
- **Two temperatures**: cold practicals = distraction (phone and laptop glow, notification blue); warm practicals = focus
  (desk lamp, candle, the lock). Locking in = the cold lights going out and the warm one taking over.
- Native moves that fit the product: *the carried light as a meter* (the focus timer); *lights popping on one by one*
  (every device locking at once: Mac, iPhone, iPad, Windows PC); *shadows jump when a light is lit* (the session starts);
  *RPG grammar* (a "Nuclear Lock" chapter card, a dialogue box for the inner voice that wants to scroll).
- UI metal: gold or copper plate + cream paper white (`#F5F0E8`) text over the dark translucent plate.
- End card: cut or fade to the cream `#F5F0E8` plate, `logo-mascot.png` centred, "welock.in" + platforms line
  (iOS · macOS · Windows) in Figtree, ink `#1A1714`. This is the one place the film leaves the diorama.
