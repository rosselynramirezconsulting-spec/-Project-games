/* ============================================================
   NUMBER RUSH — a GlitchRush mental-math arcade
   60s score-chase. Browser-first, mobile-first, viral-first.
   No dependencies. No build step. Just open and play.
   ============================================================ */
(function () {
  "use strict";

  // ---------- Config ----------
  const TIME_CAP = 30;        // max seconds the bar can hold
  const TIME_START = 25;      // starting seconds
  const TIME_GAIN = 0.6;      // + per correct
  const TIME_LOSS = 3.0;      // - per wrong
  const SPEED_WINDOW = 2.0;   // answer faster than this for speed bonus
  const STAGE_STEP = 8;       // correct answers to advance a stage
  const MAX_STAGE = 6;
  const BEST_KEY = "numberrush_best_v1";

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const app = $("app");
  const fx = $("fx");
  const ctx = fx.getContext("2d");

  const screens = { menu: $("menu"), game: $("game"), over: $("over") };
  const els = {
    start: $("startBtn"), mute: $("muteBtn"), menuBest: $("menuBest"),
    score: $("score"), mult: $("mult"), timefill: $("timefill"),
    comboLine: $("comboLine"), problem: $("problem"), choices: $("choices"),
    countdown: $("countdown"), card: $("card"),
    share: $("shareBtn"), dl: $("dlBtn"), again: $("againBtn"),
  };

  // ---------- State ----------
  let state = "menu"; // menu | count | play | over
  let score, time, combo, bestCombo, multiplier, maxMult, correctCount, stage;
  let current = null;       // { text, answer }
  let questionElapsed = 0;
  let lastT = 0;
  let muted = false;
  let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);

  // ============================================================
  //  AUDIO  (Web Audio API — no asset files)
  // ============================================================
  let actx = null;
  function audio() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { actx = null; }
    }
    return actx;
  }
  function tone(freq, dur, type, gain, when) {
    if (muted) return;
    const a = audio(); if (!a) return;
    const t0 = a.currentTime + (when || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function sfxCorrect(c) { tone(520 + Math.min(c, 12) * 30, 0.12, "triangle", 0.2); }
  function sfxWrong() { tone(150, 0.22, "sawtooth", 0.18); tone(110, 0.25, "sawtooth", 0.14, 0.03); }
  function sfxCombo() { [0, 0.07, 0.14].forEach((d, i) => tone(440 * Math.pow(1.26, i), 0.16, "square", 0.16, d)); }
  function sfxStart() { [330, 440, 660].forEach((f, i) => tone(f, 0.12, "triangle", 0.18, i * 0.09)); }
  function sfxOver() { [440, 330, 247, 165].forEach((f, i) => tone(f, 0.22, "sine", 0.18, i * 0.12)); }
  function sfxTick() { tone(900, 0.05, "square", 0.08); }

  // ============================================================
  //  PROBLEM GENERATOR  (difficulty scales with stage)
  // ============================================================
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[rnd(0, arr.length - 1)];

  function makeProblem(stg) {
    let op, a, b, answer, text;
    if (stg <= 1) op = "+";
    else if (stg === 2) op = pick(["+", "-"]);
    else if (stg === 3) op = pick(["+", "-", "×"]);
    else if (stg === 4) op = pick(["+", "-", "×", "×"]);
    else if (stg === 5) op = pick(["-", "×", "÷"]);
    else op = pick(["+", "-", "×", "÷"]);

    switch (op) {
      case "+":
        if (stg <= 1) { a = rnd(1, 9); b = rnd(1, 9); }
        else if (stg <= 3) { a = rnd(2, 20); b = rnd(2, 20); }
        else { a = rnd(10, 49); b = rnd(10, 49); }
        answer = a + b; text = a + " + " + b; break;
      case "-":
        if (stg <= 2) { a = rnd(2, 20); b = rnd(1, a); }
        else if (stg <= 4) { a = rnd(5, 40); b = rnd(1, a); }
        else { a = rnd(5, 35); b = rnd(1, 45); }   // can go negative
        answer = a - b; text = a + " − " + b; break;
      case "×":
        if (stg <= 3) { a = rnd(2, 9); b = rnd(2, 9); }
        else if (stg <= 4) { a = rnd(2, 12); b = rnd(2, 9); }
        else { a = rnd(3, 12); b = rnd(3, 12); }
        answer = a * b; text = a + " × " + b; break;
      case "÷":
        b = rnd(2, 9);
        var q = rnd(2, stg >= 6 ? 12 : 9);
        a = b * q; answer = q; text = a + " ÷ " + b; break;
    }
    return { text: text, answer: answer };
  }

  function makeChoices(answer, stg) {
    const set = new Set([answer]);
    const spread = Math.max(3, Math.round(Math.abs(answer) * 0.25) + 2);
    let guard = 0;
    while (set.size < 4 && guard++ < 60) {
      const d = answer + rnd(-spread, spread);
      if (d === answer) continue;
      if (stg <= 4 && d < 0) continue;     // keep low stages friendly
      set.add(d);
    }
    let n = 1;
    while (set.size < 4) { set.add(answer + n); n++; }
    const arr = Array.from(set);
    for (let i = arr.length - 1; i > 0; i--) { const j = rnd(0, i); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }

  // ============================================================
  //  PARTICLES  (canvas FX layer)
  // ============================================================
  let particles = [];
  let bgSymbols = [];
  let shakeT = 0, shakeMag = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = app.getBoundingClientRect();
    fx.width = r.width * dpr; fx.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fx._w = r.width; fx._h = r.height;
  }
  window.addEventListener("resize", resize);

  function initBg() {
    bgSymbols = [];
    const syms = ["+", "−", "×", "÷", "=", "7", "3", "9", "%", "√"];
    for (let i = 0; i < 16; i++) {
      bgSymbols.push({
        x: Math.random(), y: Math.random(), s: rnd(18, 54),
        sp: 0.004 + Math.random() * 0.01, sym: pick(syms),
        a: 0.03 + Math.random() * 0.05,
      });
    }
  }

  function burst(x, y, color) {
    for (let i = 0; i < 18; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 80 + Math.random() * 220;
      particles.push({
        x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 60,
        life: 0.6 + Math.random() * 0.4, t: 0, color: color, r: 2 + Math.random() * 4,
      });
    }
  }

  function shake(mag) { shakeT = 0.3; shakeMag = mag || 8; }

  function renderFx(dt) {
    const W = fx._w, H = fx._h;
    ctx.clearRect(0, 0, W, H);

    // drifting background symbols
    for (const b of bgSymbols) {
      b.y -= b.sp * dt * 60 / 60;
      if (b.y < -0.1) { b.y = 1.1; b.x = Math.random(); }
      ctx.globalAlpha = b.a;
      ctx.fillStyle = "#9fb0ff";
      ctx.font = "900 " + b.s + "px " + getFont();
      ctx.fillText(b.sym, b.x * W, b.y * H);
    }
    ctx.globalAlpha = 1;

    // particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t += dt;
      if (p.t >= p.life) { particles.splice(i, 1); continue; }
      p.vy += 520 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // screen shake on the host element
    if (shakeT > 0) {
      shakeT -= dt;
      const m = shakeMag * (shakeT / 0.3);
      app.style.transform = "translate(" + (Math.random() * 2 - 1) * m + "px," + (Math.random() * 2 - 1) * m + "px)";
    } else if (app.style.transform) {
      app.style.transform = "";
    }
  }
  function getFont() { return '"Trebuchet MS", "Segoe UI", system-ui, sans-serif'; }

  // ============================================================
  //  GAME FLOW
  // ============================================================
  function show(name) {
    for (const k in screens) screens[k].classList.toggle("hidden", k !== name);
  }

  function startGame() {
    audio(); // unlock on user gesture
    score = 0; time = TIME_START; combo = 0; bestCombo = 0;
    multiplier = 1; maxMult = 1; correctCount = 0; stage = 1;
    particles = [];
    updateHUD();
    els.comboLine.textContent = "";
    show("game");
    state = "count";
    countdown(3);
  }

  function countdown(n) {
    els.countdown.classList.remove("hidden");
    const span = els.countdown.querySelector("span");
    const tick = (k) => {
      if (k > 0) {
        span.textContent = k; span.style.animation = "none";
        void span.offsetWidth; span.style.animation = "cd 0.6s ease";
        tone(440, 0.1, "square", 0.14);
        setTimeout(() => tick(k - 1), 650);
      } else {
        span.textContent = "GO!"; span.style.animation = "none";
        void span.offsetWidth; span.style.animation = "cd 0.6s ease";
        sfxStart();
        setTimeout(() => {
          els.countdown.classList.add("hidden");
          state = "play";
          questionElapsed = 0;
          nextProblem();
        }, 450);
      }
    };
    tick(n);
  }

  function nextProblem() {
    stage = Math.min(MAX_STAGE, 1 + Math.floor(correctCount / STAGE_STEP));
    current = makeProblem(stage);
    questionElapsed = 0;
    els.problem.textContent = current.text;
    els.problem.classList.remove("bump"); void els.problem.offsetWidth;
    els.problem.classList.add("bump");

    const choices = makeChoices(current.answer, stage);
    els.choices.innerHTML = "";
    choices.forEach((val) => {
      const b = document.createElement("button");
      b.className = "choice";
      b.textContent = val;
      b.addEventListener("click", () => answer(val, b));
      els.choices.appendChild(b);
    });
  }

  function answer(val, btn) {
    if (state !== "play") return;
    const correct = val === current.answer;

    if (correct) {
      combo++;
      if (combo > bestCombo) bestCombo = combo;
      multiplier = Math.min(5, 1 + Math.floor(combo / 5));
      if (multiplier > maxMult) maxMult = multiplier;

      const speedFactor = Math.max(0, Math.min(1, (SPEED_WINDOW - questionElapsed) / SPEED_WINDOW));
      const pts = Math.round(10 * stage * multiplier * (1 + speedFactor));
      score += pts;
      time = Math.min(TIME_CAP, time + TIME_GAIN);
      correctCount++;

      btn.classList.add("right");
      const r = btn.getBoundingClientRect(), ar = app.getBoundingClientRect();
      burst(r.left - ar.left + r.width / 2, r.top - ar.top + r.height / 2, "#39ff88");
      floatPoints(pts, r, ar);
      sfxCorrect(combo);

      if (combo > 0 && combo % 5 === 0) {
        sfxCombo();
        els.mult.classList.add("pulse");
        setTimeout(() => els.mult.classList.remove("pulse"), 140);
      }
      els.comboLine.textContent = combo >= 3 ? "🔥 " + combo + " COMBO" : "";

      lockChoices();
      setTimeout(nextProblem, 90);
    } else {
      combo = 0; multiplier = 1;
      time = Math.max(0, time - TIME_LOSS);
      btn.classList.add("wrong");
      els.comboLine.textContent = "";
      shake(9);
      sfxWrong();
      // reveal correct briefly
      Array.from(els.choices.children).forEach((c) => {
        if (parseInt(c.textContent, 10) === current.answer) c.classList.add("right");
      });
      lockChoices();
      setTimeout(nextProblem, 360);
    }
    updateHUD();
  }

  function lockChoices() {
    Array.from(els.choices.children).forEach((c) => { c.style.pointerEvents = "none"; });
  }

  function floatPoints(pts, r, ar) {
    const f = document.createElement("div");
    f.className = "floatpts";
    f.textContent = "+" + pts;
    f.style.left = (r.left - ar.left + r.width / 2 - 20) + "px";
    f.style.top = (r.top - ar.top) + "px";
    app.appendChild(f);
    setTimeout(() => f.remove(), 800);
  }

  function updateHUD() {
    els.score.textContent = score;
    els.mult.textContent = "x" + multiplier;
  }

  let lowTickAcc = 0;
  function updateTime(dt) {
    time -= dt;
    if (time <= 0) { time = 0; endGame(); return; }
    const frac = time / TIME_CAP;
    els.timefill.style.width = (frac * 100) + "%";
    const low = time <= 6;
    els.timefill.classList.toggle("low", low);
    if (low) {
      lowTickAcc += dt;
      if (lowTickAcc >= 1) { lowTickAcc = 0; sfxTick(); }
    }
  }

  function endGame() {
    state = "over";
    sfxOver();
    if (score > best) { best = score; localStorage.setItem(BEST_KEY, String(best)); }
    els.menuBest.textContent = best;
    drawCard();
    show("over");
  }

  // ============================================================
  //  SCORE CARD  (offscreen render → shareable PNG)
  // ============================================================
  function drawCard() {
    const c = els.card, g = c.getContext("2d");
    const W = c.width, H = c.height;
    const isRecord = score >= best && score > 0;

    // bg
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a1a3a"); grad.addColorStop(1, "#0a0a12");
    g.fillStyle = grad; g.fillRect(0, 0, W, H);

    // faint symbols
    g.fillStyle = "rgba(159,176,255,0.05)";
    const syms = ["+", "×", "÷", "−", "=", "7", "9"];
    for (let i = 0; i < 26; i++) {
      g.font = "900 " + rnd(40, 120) + "px " + getFont();
      g.fillText(pick(syms), Math.random() * W, Math.random() * H);
    }

    g.textAlign = "center";

    // title
    g.font = "900 88px " + getFont();
    g.fillStyle = "#ffffff";
    g.fillText("NUMBER", W / 2, 200);
    g.fillStyle = "#39ff88";
    g.fillText("RUSH", W / 2, 296);

    // record badge
    if (isRecord) {
      g.font = "900 38px " + getFont();
      g.fillStyle = "#ffd23c";
      g.fillText("★ NEW PERSONAL BEST ★", W / 2, 380);
    }

    // big score
    g.font = "900 300px " + getFont();
    const sg = g.createLinearGradient(0, 480, 0, 800);
    sg.addColorStop(0, "#ffffff"); sg.addColorStop(1, "#22d3ee");
    g.fillStyle = sg;
    g.fillText(String(score), W / 2, 760);
    g.font = "800 44px " + getFont();
    g.fillStyle = "#8a90b8";
    g.fillText("SCORE", W / 2, 830);

    // stat row
    const stats = [
      ["BEST COMBO", "🔥 " + bestCombo],
      ["MAX MULT", "x" + maxMult],
      ["LEVEL", String(Math.min(MAX_STAGE, stage))],
    ];
    const colW = W / 3;
    stats.forEach((s, i) => {
      const cx = colW * i + colW / 2;
      g.font = "800 34px " + getFont();
      g.fillStyle = "#8a90b8";
      g.fillText(s[0], cx, 980);
      g.font = "900 60px " + getFont();
      g.fillStyle = "#ffffff";
      g.fillText(s[1], cx, 1050);
    });

    // call to action
    g.font = "900 56px " + getFont();
    g.fillStyle = "#ff3cac";
    g.fillText("CAN YOU BEAT ME? 👀", W / 2, 1200);

    // brand / url
    g.font = "800 44px " + getFont();
    g.fillStyle = "#39ff88";
    g.fillText("glitchrush.gg", W / 2, 1290);
  }

  async function shareCard() {
    const c = els.card;
    const text = "I scored " + score + " on Number Rush 🔥 Can you beat me? Play free at glitchrush.gg";
    c.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "numberrush.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Number Rush", text: text });
          return;
        } catch (e) { /* user cancelled or failed → fall through */ }
      }
      downloadCard();
    }, "image/png");
  }

  function downloadCard() {
    const url = els.card.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "numberrush-" + score + ".png";
    document.body.appendChild(a); a.click(); a.remove();
  }

  // ============================================================
  //  MAIN LOOP
  // ============================================================
  function loop(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000) || 0;
    lastT = t;
    if (state === "play") {
      questionElapsed += dt;
      updateTime(dt);
    }
    renderFx(dt);
    requestAnimationFrame(loop);
  }

  // ============================================================
  //  INPUT / WIRING
  // ============================================================
  els.start.addEventListener("click", startGame);
  els.again.addEventListener("click", startGame);
  els.share.addEventListener("click", shareCard);
  els.dl.addEventListener("click", downloadCard);
  els.mute.addEventListener("click", () => {
    muted = !muted;
    els.mute.textContent = muted ? "🔇" : "🔊";
  });

  // keyboard: 1-4 / a-d to answer
  window.addEventListener("keydown", (e) => {
    if (state === "play") {
      const map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      const i = map[e.key.toLowerCase()];
      if (i !== undefined && els.choices.children[i]) els.choices.children[i].click();
    } else if (state === "menu" && (e.key === "Enter" || e.key === " ")) {
      startGame();
    }
  });

  // ---------- init ----------
  function init() {
    resize();
    initBg();
    els.menuBest.textContent = best;
    show("menu");
    requestAnimationFrame(loop);
  }
  init();
})();
