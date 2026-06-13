# GlitchRush — Math Game Concept & Feasibility Analysis

> A standalone game concept for **glitchrushgg.com**. Unrelated to "Don't Drown, Noah!".
> Goal: a viral, browser-first math game built for TikTok-driven growth.

---

## 1. Why now — the opportunity

Three signals from market research line up:

- **Browser-first, skill-driven games are winning again in 2025–2026.** Instant play (no install)
  maximizes the probability of viral spread; the community (TikTok / Discord) becomes a co-creator
  that amplifies reach. This is exactly the lane GlitchRush already plays in.
- **Math has a proven viral audience.** Eddie Woo ("Mister Wootube") turned high-school math lessons
  into 2M subscribers and 187M+ views — driven by an authentic human story and *joy*, not drills.
  BlackPenRedPen, Math Antics, etc. confirm an appetite for fun, fast math.
- **A built-in mission/PR hook.** A national push for "K-12 math literacy" and youth-led math advocacy
  (AIMS Youth Advisors, the Algebra Project lineage) gives a math game a purpose narrative that
  pure entertainment titles lack — useful for press, schools, and parents.

The intersection — **instant browser game + math + authentic joy + TikTok community** — is an
under-served, low-cost-to-enter niche.

---

## 2. The core risk to beat: the "broccoli problem"

Educational games usually fail because they feel like homework. The rule for this project:

> **Game first, math second.** The math must *be* the mechanic, not a quiz bolted onto a game.
> Players should feel they're playing an arcade game that happens to sharpen mental math —
> the way Eddie Woo makes math feel like play, not a lesson.

If a player would rather close the tab than do "one more problem," the design has failed.

---

## 3. Recommended concept: **"Number Rush"** (score-chase mental-math arcade)

A 60-second, one-thumb, score-chase game. Pick the format that tested best in our viral research:
a **high-score arcade loop with a shareable score card** — the exact pattern already proven in Noah.

**Loop:**
1. A target number is shown (e.g. `17`).
2. Tiles with numbers/operations fall or float; tap to build to the target fast.
3. Speed + streaks = multiplier. Difficulty ramps (bigger numbers, negatives, then multiplication).
4. One wrong/slow answer ends the run → instant **shareable score card** ("I hit 4,200 — beat me").

**Why it goes viral:**
- Pure score-chase = the most TikTok-native format ("can you beat this?", duet/stitch challenges).
- Sessions are ~60s → perfect for short-form video and "one more try."
- The shareable score card (already built for Noah) is the growth engine, reused.

**Alternative concepts considered:**
| Concept | Virality | Build cost | Verdict |
|---|---|---|---|
| Number Rush (score-chase) | High | Low | **Recommended** |
| Math Duel (1v1 quick duels) | High | Medium (needs netcode/async) | Phase 2 |
| Number-merge (2048-like) | Medium-High | Low | Strong fallback |
| Math endless-runner | Medium | Medium | Riskier (broccoli risk) |

---

## 4. Technical feasibility — **low cost, high reuse**

GlitchRush already owns the entire stack this needs (from the Noah build):

- **Phaser 3**, ES modules, CDN load, no build step → ship to GitHub Pages / glitchrushgg.com fast.
- **Procedural graphics** (Phaser Graphics API) and **Web Audio** sounds → zero external assets.
- **Shareable score-card / PNG export system** → already written; port directly.
- Mobile-first tap controls → already proven on iOS Safari / Android Chrome.

**Estimate:** A polished MVP is realistic in days, not weeks, because ~60% of the plumbing
(scenes, HUD, sound manager, score card, mobile input) is reusable from Noah.

---

## 5. Distribution & growth

- **Primary channel: TikTok.** Post short clips of high-score runs; lean on the "beat my score"
  challenge and duets. Indie browser games in 2025 use TikTok as the first platform, not an afterthought.
- **Instant link.** Browser play means a single URL in bio converts a viewer to a player in one tap.
- **Mission angle for PR/schools.** A "free math-literacy game" framing opens doors to teachers,
  parent groups, and education press that entertainment-only titles can't reach.
- **Leaderboards / weekly seeds** to keep the community returning and re-sharing.

---

## 6. Recommendation

**Proceed.** This is a high-fit, low-risk bet for GlitchRush:

- It reuses the existing tech and the proven shareable-score-card growth engine.
- It targets a validated viral audience (math content) in a validated viral format (instant browser score-chase).
- It carries an optional mission narrative for extra reach.

**Suggested next step:** Build a one-screen "Number Rush" MVP (target number + tap-to-build + 60s timer
+ score card) as a separate repo/page under glitchrushgg.com, then test 3–5 TikTok clips before
investing in modes like Math Duel.

---

### Sources
- Eddie Woo / Wootube: <https://en.wikipedia.org/wiki/Eddie_Woo> · <https://www.youtube.com/@misterwootube>
- Browser challenge games rising (2025): <https://medium.com/@280134408zaro/the-rise-of-browser-based-challenge-games-in-2025-why-small-skill-driven-titles-are-winning-again-05a66fbe8722>
- Indie dev TikTok guide (2025): <https://acorngames.gg/blog/2025/8/10/the-indie-devs-guide-to-mastering-tiktok-in-2025>
- K-12 math literacy organizing: <https://mathvoices.ams.org/teachingandlearning/organizing-for-k-12-math-literacy-for-all/>
- Math education reform context (Gates Foundation): <https://usprogram.gatesfoundation.org/news-and-insights/articles/whats-next-for-math-education-and-why-it-matters-for-every-students-future>
