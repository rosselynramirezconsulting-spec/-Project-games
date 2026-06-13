# Number Rush 🔢⚡

A **GlitchRush** mental-math arcade. 60-second score-chase, built browser-first and
mobile-first for TikTok-driven virality. Zero dependencies, zero build step — just open
`index.html` (or deploy the folder anywhere static).

> Standalone game. Not related to "Don't Drown, Noah!".

---

## The loop

1. An equation flashes (`7 + 8`).
2. Tap the right answer from four tiles — fast.
3. **Speed + streaks** raise your multiplier (up to **x5**). Every correct answer buys
   you a sliver of time; every miss costs you.
4. The clock never stops draining → "one more run" tension.
5. When time hits zero you get a **shareable score card** ("Can you beat me? 👀").

Difficulty auto-scales across 6 stages: addition → subtraction → times tables →
mixed → negatives → division. The longer you survive, the harder (and higher-scoring) it gets.

## Viral design (why it spreads)

- **Instant play.** One URL, one tap, in-browser. No install friction.
- **Score-chase format.** The most TikTok-native loop — "beat my score" duets & stitches.
- **Shareable PNG card.** Auto-generated portrait card (1080×1350) with score, best combo,
  max multiplier, level, and a `glitchrush.gg` call-to-action. Uses the Web Share API on
  mobile (share sheet straight to TikTok/IG), with a PNG download fallback on desktop.
- **~60-second sessions.** Perfect length for short-form video.
- **Personal best** persisted in `localStorage` to pull players back.

## Controls

| | Desktop | Mobile |
|---|---|---|
| Answer | Keys `1`–`4` (or `A`–`D`) | Tap a tile |
| Start | `Enter` / `Space` | Tap **PLAY** |
| Mute | 🔊 button | 🔊 button |

## Tech

- Vanilla JS + Canvas. No frameworks, no CDN, works offline once loaded.
- **Web Audio API** for all sound (no audio files).
- Canvas FX layer: particle bursts, screen shake, drifting math symbols.
- Offscreen canvas renders the share card.

## Run / deploy

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8080      # then open http://localhost:8080/math/
```

Deploys as-is to GitHub Pages / any static host. Drop it behind `glitchrush.gg`.

## Tuning

All knobs live at the top of `game.js`:

```
TIME_START / TIME_CAP / TIME_GAIN / TIME_LOSS  — pace & tension
SPEED_WINDOW                                    — speed-bonus window
STAGE_STEP / MAX_STAGE                          — difficulty ramp
```

MIT — free for personal, educational, and commercial use.
