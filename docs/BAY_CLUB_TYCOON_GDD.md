# Bay Club Tycoon — Game Design Document

> **Working title:** Bay Club Tycoon *(alt names: Rescue Bay, Sunset Bay, Lifeguard Tycoon, Bay Watch Club)*
> **Genre:** Idle Tycoon + Arcade Rescue hybrid
> **Platform (v1):** Mobile — iOS & Android (portrait)
> **Engine:** Phaser 3 (web) wrapped with Capacitor for native stores *(reuses this repo's existing stack)*
> **Audience:** 13+ casual & hyper-casual players; broad mass-market appeal
> **Business model:** Free-to-play — rewarded ads + cosmetic IAP (no pay-to-win)
> **Status:** Design v1.0 — pre-production

---

## 1. The One-Line Pitch

> *Build the hottest beach club on the coast — and be its star lifeguard. Grow your empty stretch of sand into a packed mega-resort, then sprint (in glorious slow motion) to save drowning swimmers and keep your reputation soaring.*

If you can only explain one thing in 5 seconds: **"Tap to grow your beach club, swipe to do the slow-mo rescue run."**

---

## 2. Why This Wins (Market Rationale)

Grounded in June 2026 market research:

| Insight | How we exploit it |
|---|---|
| **Beach-club tycoon is the hot genre** (*Beach Club* by Rike Games rated 9.0; *Beach Club Tycoon*, *Beach Club Simulator* all popular). | We use the proven idle-tycoon core loop as our backbone. |
| **No lifeguard game has gone viral** — dozens of low-budget rescue titles exist, none broke out. | We own this open lane by fusing rescue with the tycoon loop nobody else has. |
| **Viral 2026 games are explainable in 5 seconds**, reward short sessions, and lean on satisfying **before/after transformation** clips. | Empty-beach → packed-resort glow-up is a perfect TikTok transformation. |
| **The Baywatch slow-mo run is a living TikTok meme** and one of pop culture's most recognizable visuals. | Our signature rescue mechanic *is* the slow-mo run — free organic marketing. |
| **Monetization is shifting from gating to aspiration/status cosmetics.** | We sell lifeguard outfits, boards, club skins — not progress. |

**Two built-in viral moments:**
1. 🏃 **The Slow-Mo Run** — share-ready rescue clip.
2. 🏖️ **The Glow-Up** — timelapse of a barren beach becoming a mega-resort.

---

## 3. Core Gameplay — Two Interlocking Loops

### Loop A — The Tycoon Loop (the "always-on" backbone)
1. **Guests arrive** at your beach and spend money (loungers, bar, jet-ski rental, cabanas, food stalls).
2. **Collect income** — taps or auto-collect; idle earnings accrue while away.
3. **Reinvest** to upgrade stations, hire staff, and expand to new sections of the bay.
4. **Reputation (★)** gates expansion — higher rep unlocks new zones, guest types, and cosmetics.

### Loop B — The Rescue Loop (the "spike" that feeds Loop A)
1. A **drowning alarm** triggers (a guest flag turns red out in the water).
2. **The Slow-Mo Run** — player swipes/holds to sprint down the sand; a stylized slow-motion sequence with rhythm timing.
3. **The Swim & Save** — quick mini-interaction (tap-timing or swipe-to-paddle) to reach and tow the swimmer back with the red-and-white lifebuoy.
4. **Payoff** — successful rescue = **+Reputation, +tip bonus, +crowd cheer**. Failure = rep hit & a sad guest leaves.

> **The hook:** Rescues are the *only* fast way to grow Reputation, and Reputation is what unlocks everything. So players *want* the action loop — it's not a chore, it's the accelerator.

### Session shape
- **30–90 second sessions** work (collect, one rescue, one upgrade).
- **Idle accrual** rewards coming back (capped offline earnings → light pressure to return + optional rewarded-ad "double offline cash").

---

## 4. Progression & Economy

### Currencies
| Currency | Source | Spend |
|---|---|---|
| 💰 **Cash** (soft) | Guest income, idle accrual, rescue tips | Upgrades, new stations, expansion |
| ⭐ **Reputation** (gate) | **Rescues** (primary), 5-star guest reviews | Unlock zones, guest tiers, prestige |
| 💎 **Gems** (premium) | IAP, rare rewards, daily streak | Cosmetics, speed-ups (optional), extra rescue retries |

### Expansion tiers (the "map")
Each tier is a visible chunk of coastline the player unlocks and transforms:

1. **The Strip** — basic loungers + a single guard tower (tutorial bay).
2. **The Bar & Boardwalk** — drinks, snacks, music; bigger crowds.
3. **Watersports Dock** — jet-skis, paddleboards → more rescues, higher stakes.
4. **The Cabana Resort** — VIP guests, big tips, premium aesthetics.
5. **Sunset Marina** — yachts, fireworks, endgame flex.
6. **Prestige / New Bay** — reset for a permanent multiplier + a brand-new themed coastline (winter bay, tropical bay, neon bay).

### Difficulty curve
- More guests = more simultaneous drowning risk = rescue loop scales up (multiple alarms, rip-current events, storm days).
- Staff lifeguards can be **hired** to auto-handle minor rescues; the *player* handles the big, dramatic ones (the share-worthy moments).

---

## 5. The Signature Mechanic: The Slow-Mo Run (detailed)

This is the soul of the game. It must feel *amazing* and look *meme-able*.

- **Trigger:** Red alarm + audio sting. Camera snaps to the guard tower.
- **Run phase:** Screen desaturates slightly, framerate-style slow-mo VFX, sand kicks up, hair/flag physics. Player swipes to build momentum; a **rhythm bar** rewards good timing with a speed boost.
- **Hero moment:** A brief auto-cinematic dive into the water (the screenshot money-shot).
- **Swim phase:** Simple swipe-to-paddle toward the swimmer before a stamina/air timer empties.
- **Tow back:** Grab the lifebuoy ring, return to shore, crowd erupts.
- **Built-in share:** After a *great* rescue, offer a one-tap **"Share your run"** → exports a short clip/GIF. (Hooks directly into the existing `src/utils/Share.js`.)

**Juice checklist:** slow-mo desat, screen shake on dive, lens flare at sunset, crowd cheer SFX, slow-mo whoosh, confetti on perfect rescue, combo counter for rescue streaks.

---

## 6. Art Direction

- **Style:** Bright, clean, stylized flat/cartoon vector — readable on small screens, cheap to produce, on-trend.
- **Palette:** Sea blues, warm sand, sunset oranges, and the iconic **red-and-white lifebuoy** as the brand motif (lifted from the reference image — the ring, not the logo/name).
- **Camera:** Top-down/isometric for the tycoon view; dynamic side/3-quarter cinematic during rescues.
- **Mascot:** A charismatic lifeguard avatar (customizable) — the face of the marketing.
- **Asset reuse:** This repo already generates textures procedurally (`src/utils/Graphics.js`) and ships sound via Web Audio (`src/utils/SoundManager.js`) — both directly reusable to prototype with zero external art.

---

## 7. Monetization (player-friendly)

| Stream | Detail |
|---|---|
| **Rewarded ads** | Double offline earnings, rescue retry, 2× tip after rescue, free daily gem. Always opt-in. |
| **Cosmetic IAP** | Lifeguard outfits, board skins, club themes, jet-ski paint, mascot pets. Pure status/aspiration. |
| **Starter / theme bundles** | Discounted gem + cosmetic packs, seasonal themes (Summer, Neon, Tropical). |
| **Battle-pass ("Bay Pass")** | Seasonal cosmetic track; free + premium lanes. |
| **No pay-to-win** | Gems never buy reputation directly; speed-ups are time-only, never gameplay advantage. |

---

## 8. Retention & Virality Systems

- **Daily login streak** → gems + a special daily VIP-guest rescue.
- **Weekly events** — "Storm Weekend" (rescue rush), "Celebrity Guest" (big tipper), "Shark Scare" (limited-time mode).
- **Leaderboards** — most rescues, biggest club, longest rescue streak.
- **Reputation milestones** post share cards automatically.
- **Friend visits / gifting** (lightweight social, phase 2).
- **The two share buttons:** "Share your run" (clip) + "Share your bay" (before/after timelapse).

---

## 9. Sound Design

- Chill tropical/house background loop (the "beach club" vibe).
- Distinct alarm sting that creates urgency without stress.
- Slow-mo whoosh, water splash, crowd cheers, cash-register *ka-ching*.
- Prototype with Web Audio tones (existing `SoundManager`), swap for licensed tracks pre-launch.

---

## 10. Technical Plan

- **Engine:** Phaser 3 (already in this repo) → fast to prototype in-browser, then wrap with **Capacitor** for iOS/Android store builds.
- **Orientation:** Portrait-first; touch zones for run/swipe.
- **Save:** LocalStorage for prototype → cloud save (Firebase/Playfab) for launch.
- **Scene structure (mirrors existing pattern):**
  - `BootScene` — procedural textures / asset load
  - `MenuScene` — title + "tap to play"
  - `BayScene` — the tycoon view (guests, stations, income)
  - `RescueScene` — the slow-mo run + swim mini-game
  - `UIScene` — HUD (cash, rep, gems, alarms)
  - `ShopScene` — cosmetics & IAP
  - `ResultScene` — rescue payoff + share card
- **Analytics from day one:** session length, rescue success rate, ad opt-in rate, D1/D7 retention, funnel per expansion tier.

---

## 11. Roadmap

| Phase | Goal | Deliverable |
|---|---|---|
| **0 — Prototype** | Prove the *feel* of the Slow-Mo Run. | Playable single-rescue loop (web, procedural art). |
| **1 — Core loop** | Tycoon + rescue interlock, 2 expansion tiers. | Vertical slice, soft-launch ready. |
| **2 — Content** | 5 tiers, cosmetics, events, share cards. | Open beta. |
| **3 — Live ops** | Bay Pass, leaderboards, seasonal themes. | Global launch + UA campaign. |

**Recommended first build:** the **Concept B prototype** of the Slow-Mo Run mini-game — it's the riskiest/most important "does it feel good?" question. Everything else is proven tycoon scaffolding.

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Rescue loop feels like a chore interrupting idle play. | Make rescues *short, juicy, and the only fast rep source* — desire, not obligation. Auto-staff handles minor ones. |
| Tycoon genre is crowded. | The lifeguard fusion + slow-mo meme is the differentiator; no competitor has both. |
| Slow-mo novelty wears off. | Variety: rip currents, storms, shark scares, celebrity rescues, combo streaks, leaderboards. |
| Ad fatigue. | All ads opt-in/rewarded; never forced interstitials mid-rescue. |

---

## 13. Reference & Sources

Concept inspired by a real beach-club sign with the classic red-and-white lifebuoy (used as visual/theme reference only — no real names, numbers, or logos used).

Market research:
- [Beach Club (Rike Games) — CrazyGames](https://www.crazygames.com/game/beach-club)
- [Beach Club Simulator — Steam](https://store.steampowered.com/app/2335810/)
- [Beach Club Tycoon: Idle Game — Google Play](https://play.google.com/store/apps/details?id=com.Medu.idle.beach.tycoon.cash.manager.simulator)
- [Beach Rescue Lifeguard Game — Google Play](https://play.google.com/store/apps/details?id=com.zaibigamesstudios.lifeguardteam.game.beachrescue)
- [Storm Force Rescue (RNLI)](https://rnli.org/news-and-media/2024/april/05/new-video-game-by-the-rnli-gives-kids-lifesaving-introduction)
- [TikTok Gaming Trends 2026 — Viryze](https://viryze.com/blog/tiktok-gaming-trends-2026)
- [Roblox Trends in Gaming 2026 — Game-Ace](https://game-ace.com/blog/roblox-trends-in-gaming/)
- [The Slow-Motion Run — Baywatch Fandom](https://baywatch.fandom.com/wiki/The_Slow-motion_run)
</content>
</invoke>
