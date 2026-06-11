import SoundManager from '../utils/SoundManager.js';

// sceneParts  → absolute screen coords (s=1, ox=0, oy=0)
// parts       → animal coord space via s/ox/oy
// Parchment area: x 15–375, y 77–539
// Animal zone (s=8, ox=35, oy=145): y 145–465, x 35–355
// Sky strip y 77–145 · Ground strip y 465–539
// 'poly' shape: ['poly', [[x1,y1],[x2,y2],...]]  — filled/stroked polygon

const PAGES = {

  // ── Noah ───────────────────────────────────────────────────────────────
  noah: {
    s: 6, ox: 66, oy: 127, tex: 'noah', label: 'Noah',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 50]] },      // sky
      { shapes: [['circle', 330, 99, 18]] },         // sun
      { shapes: [['rect', 15, 511, 360, 28]] },      // ground
    ],
    parts: [
      { shapes: [['rect', 37, 20, 5, 44]] },         // staff
      { shapes: [['poly', [[9,30],[36,30],[38,64],[7,64]]]] },  // robe (trapezoid)
      { shapes: [['circle', 24, 18, 13]] },          // head
      { shapes: [['poly', [[14,26],[34,26],[30,40],[24,44],[18,40]]]] }, // beard
      { shapes: [['rect', 8, 10, 32, 8], ['rect', 11, 6, 26, 6]] },     // hood/hat
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x222222, 1);
      g.fillCircle(T(20), Y(16), 2.5 * s);
      g.fillCircle(T(28), Y(16), 2.5 * s);
      g.lineStyle(4, 0x222222, 1);
      g.strokePoints([{ x: T(20), y: Y(21) }, { x: T(24), y: Y(24) }, { x: T(28), y: Y(21) }], false);
    },
  },

  // ── Elephant ───────────────────────────────────────────────────────────
  elephant: {
    s: 8, ox: 35, oy: 145, tex: 'elephant', label: 'Elephant',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },
      { shapes: [['circle', 330, 104, 20]] },
      { shapes: [['rect', 307, 92, 14, 153]] },
      { shapes: [['ellipse', 314, 108, 90, 32]] },
      { shapes: [['rect', 15, 465, 360, 74]] },
      { shapes: [['ellipse', 102, 492, 82, 22]] },
    ],
    parts: [
      { shapes: [['ellipse', 20, 28, 24, 20]] },                    // body (wide oval)
      { shapes: [['ellipse', 8, 14, 10, 17]] },                     // left ear
      { shapes: [['ellipse', 32, 14, 10, 17]] },                    // right ear
      { shapes: [['circle', 20, 14, 12]] },                         // head
      { shapes: [['rect', 17, 23, 6, 14], ['ellipse', 20, 37, 10, 6]] }, // trunk + tip
      { shapes: [['rect', 8, 35, 6, 9], ['rect', 15, 35, 6, 9],
                 ['rect', 22, 35, 6, 9], ['rect', 30, 35, 6, 9]] }, // 4 legs
    ],
    details(g, T, Y, s) {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(T(16), Y(12), 3 * s);
      g.fillCircle(T(24), Y(12), 3 * s);
      g.fillStyle(0x222222, 1);
      g.fillCircle(T(16), Y(12), 2 * s);
      g.fillCircle(T(24), Y(12), 2 * s);
      g.fillStyle(0xfffacd, 1);
      g.fillTriangle(T(15), Y(22), T(18), Y(22), T(14), Y(27));
      g.fillTriangle(T(22), Y(22), T(25), Y(22), T(26), Y(27));
    },
  },

  // ── Giraffe ────────────────────────────────────────────────────────────
  giraffe: {
    s: 8, ox: 35, oy: 145, tex: 'giraffe', label: 'Giraffe',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },
      { shapes: [['circle', 55, 104, 20]] },
      { shapes: [['rect', 318, 82, 14, 185]] },
      { shapes: [['circle', 325, 100, 44]] },
      { shapes: [['rect', 15, 465, 360, 74]] },
      { shapes: [['rect', 15, 454, 360, 13]] },
    ],
    parts: [
      { shapes: [['ellipse', 20, 38, 22, 15]] },                    // body
      { shapes: [['poly', [[15,14],[25,14],[27,38],[13,38]]]] },     // neck (tapering)
      { shapes: [['ellipse', 20, 9, 14, 9]] },                      // head
      { shapes: [['rect', 15, 2, 3, 8], ['rect', 22, 2, 3, 8]] },   // ossicones
      { shapes: [['rect', 12, 26, 5, 5], ['rect', 20, 30, 5, 5],
                 ['rect', 15, 19, 5, 5], ['rect', 24, 22, 5, 5]] }, // spots
      { shapes: [['rect', 10, 41, 5, 7], ['rect', 16, 41, 5, 7],
                 ['rect', 25, 41, 5, 7], ['rect', 31, 41, 5, 7]] }, // 4 legs
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x222222, 1);
      g.fillCircle(T(16), Y(7), 2 * s);
      g.fillCircle(T(24), Y(7), 2 * s);
      g.lineStyle(3, 0x222222, 1);
      g.strokePoints([{ x: T(16), y: Y(11) }, { x: T(20), y: Y(13) }, { x: T(24), y: Y(11) }], false);
    },
  },

  // ── Lion ───────────────────────────────────────────────────────────────
  lion: {
    s: 8, ox: 35, oy: 145, tex: 'lion', label: 'Lion',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },
      { shapes: [['rect', 15, 454, 360, 13]] },
      { shapes: [['circle', 55, 468, 28]] },
      { shapes: [['circle', 335, 468, 24]] },
      { shapes: [['rect', 15, 465, 360, 74]] },
    ],
    parts: [
      { shapes: [['ellipse', 20, 36, 20, 13]] },                    // body
      { shapes: [['poly', [[32,28],[38,28],[40,36],[38,44],[35,45]]]] }, // tail
      { shapes: [['circle', 38, 41, 6]] },                          // tail tuft
      { shapes: [['circle', 20, 22, 17]] },                         // mane
      { shapes: [['circle', 20, 22, 12]] },                         // face
      { shapes: [['ellipse', 20, 27, 10, 7]] },                     // muzzle
      { shapes: [['ellipse', 10, 38, 9, 6], ['ellipse', 30, 38, 9, 6]] }, // paws
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x222222, 1);
      g.fillCircle(T(16), Y(19), 2 * s);
      g.fillCircle(T(24), Y(19), 2 * s);
      g.fillCircle(T(20), Y(24), 2.5 * s);
      g.lineStyle(3, 0x222222, 1);
      g.lineBetween(T(20), Y(24), T(16), Y(26));
      g.lineBetween(T(20), Y(24), T(24), Y(26));
    },
  },

  // ── Zebra ──────────────────────────────────────────────────────────────
  zebra: {
    s: 8, ox: 35, oy: 145, tex: 'zebra', label: 'Zebra',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },
      { shapes: [['tri', 15, 145, 120, 77, 225, 145]] },
      { shapes: [['tri', 165, 145, 270, 77, 375, 145]] },
      { shapes: [['rect', 15, 454, 52, 18], ['rect', 78, 449, 42, 23],
                 ['rect', 298, 451, 47, 21], ['rect', 338, 455, 37, 17]] },
      { shapes: [['rect', 15, 465, 360, 74]] },
    ],
    parts: [
      { shapes: [['ellipse', 20, 27, 24, 18]] },                    // white body
      { shapes: [['poly', [[14,12],[26,12],[28,26],[12,26]]]] },     // neck
      { shapes: [['ellipse', 20, 8, 14, 10]] },                     // head
      { shapes: [['tri', 14,3,18,-1,21,3], ['tri', 19,3,23,-1,26,3]] }, // pointed ears
      { shapes: [['rect', 17, 2, 5, 18]] },                         // mane
      { shapes: [
        ['rect', 9, 18, 22, 3], ['rect', 11, 23, 20, 3],
        ['rect', 10, 28, 22, 3], ['rect', 12, 34, 18, 3],
        ['rect', 15, 12, 10, 3], ['rect', 15, 7, 10, 3],
      ] },                                                           // stripes
      { shapes: [['rect', 9, 36, 5, 8], ['rect', 15, 36, 5, 8],
                 ['rect', 22, 36, 5, 8], ['rect', 28, 36, 5, 8]] }, // 4 legs
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x111111, 1);
      g.fillCircle(T(16), Y(7), 2 * s);
      g.fillCircle(T(24), Y(7), 2 * s);
      g.fillCircle(T(20), Y(11), 2 * s);
    },
  },

  // ── Monkey ─────────────────────────────────────────────────────────────
  monkey: {
    s: 8, ox: 35, oy: 145, tex: 'monkey', label: 'Monkey',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },
      { shapes: [['rect', 15, 90, 26, 385]] },
      { shapes: [['circle', 28, 110, 36], ['circle', 28, 200, 28], ['circle', 28, 290, 24]] },
      { shapes: [['rect', 349, 90, 26, 385]] },
      { shapes: [['circle', 362, 110, 36], ['circle', 362, 200, 28], ['circle', 362, 290, 24]] },
      { shapes: [['rect', 40, 212, 310, 12]] },
      { shapes: [['rect', 15, 465, 360, 74]] },
    ],
    parts: [
      { shapes: [['circle', 20, 18, 13]] },                         // head
      { shapes: [['ellipse', 20, 32, 16, 14]] },                    // body
      { shapes: [['circle', 6, 17, 6], ['circle', 34, 17, 6]] },    // ears
      { shapes: [['poly', [[4,24],[10,24],[8,36],[2,36]]]] },        // left arm
      { shapes: [['poly', [[30,24],[36,24],[38,36],[32,36]]]] },     // right arm
      { shapes: [['ellipse', 20, 22, 13, 10]] },                    // face skin
      { shapes: [['ellipse', 20, 26, 9, 6]] },                      // muzzle
      { shapes: [['poly', [[26,34],[30,34],[33,42],[28,45]]]] },     // tail
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x222222, 1);
      g.fillCircle(T(16), Y(18), 2 * s);
      g.fillCircle(T(24), Y(18), 2 * s);
      g.fillCircle(T(20), Y(25), 2 * s);
      g.lineStyle(3, 0x222222, 1);
      g.strokePoints([{ x: T(16), y: Y(28) }, { x: T(20), y: Y(30) }, { x: T(24), y: Y(28) }], false);
    },
  },

  // ── Rabbit ─────────────────────────────────────────────────────────────
  rabbit: {
    s: 8, ox: 35, oy: 145, tex: 'rabbit', label: 'Rabbit',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },
      { shapes: [['circle', 330, 104, 20]] },
      { shapes: [['rect', 15, 465, 360, 74]] },
      { shapes: [['circle', 58, 483, 16], ['circle', 92, 476, 12]] },
      { shapes: [['circle', 293, 480, 14], ['circle', 335, 477, 16]] },
      { shapes: [['tri', 252, 462, 272, 462, 262, 480]] },
    ],
    parts: [
      { shapes: [['ellipse', 20, 30, 20, 22]] },                    // body
      { shapes: [['circle', 20, 16, 12]] },                         // head
      { shapes: [['rect', 12, -3, 8, 20], ['rect', 21, -3, 8, 20]] }, // tall ears
      { shapes: [['rect', 13, -2, 6, 17], ['rect', 22, -2, 6, 17]] }, // inner ear (lighter)
      { shapes: [['circle', 20, 20, 3]] },                          // nose
      { shapes: [['ellipse', 12, 39, 12, 7], ['ellipse', 28, 39, 12, 7]] }, // feet
      { shapes: [['circle', 31, 28, 5]] },                          // tail
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x222222, 1);
      g.fillCircle(T(16), Y(15), 2 * s);
      g.fillCircle(T(24), Y(15), 2 * s);
      g.lineStyle(3, 0x222222, 1);
      g.lineBetween(T(16), Y(20), T(12), Y(22));
      g.lineBetween(T(16), Y(20), T(12), Y(19));
      g.lineBetween(T(24), Y(20), T(28), Y(22));
      g.lineBetween(T(24), Y(20), T(28), Y(19));
    },
  },

  // ── Penguin ────────────────────────────────────────────────────────────
  penguin: {
    s: 8, ox: 35, oy: 145, tex: 'penguin', label: 'Penguin',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },
      { shapes: [['tri', 15, 145, 80, 77, 145, 145]] },
      { shapes: [['tri', 230, 145, 295, 80, 360, 145]] },
      { shapes: [['rect', 15, 453, 55, 50], ['rect', 310, 450, 55, 54]] },
      { shapes: [['rect', 15, 465, 360, 40]] },
      { shapes: [['rect', 15, 500, 360, 39]] },
    ],
    parts: [
      { shapes: [['ellipse', 20, 26, 20, 26]] },                    // body (black)
      { shapes: [['ellipse', 8, 26, 8, 18], ['ellipse', 32, 26, 8, 18]] }, // flippers
      { shapes: [['ellipse', 20, 28, 13, 21]] },                    // white belly
      { shapes: [['circle', 20, 11, 10]] },                         // head
      { shapes: [['tri', 17, 15, 23, 15, 20, 20]] },                // beak
      { shapes: [['ellipse', 13, 41, 10, 6], ['ellipse', 27, 41, 10, 6]] }, // feet
    ],
    details(g, T, Y, s) {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(T(16), Y(10), 3 * s);
      g.fillCircle(T(24), Y(10), 3 * s);
      g.fillStyle(0x222222, 1);
      g.fillCircle(T(16), Y(10), 2 * s);
      g.fillCircle(T(24), Y(10), 2 * s);
    },
  },

  // ── Bear ───────────────────────────────────────────────────────────────
  bear: {
    s: 8, ox: 35, oy: 145, tex: 'bear', label: 'Bear',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },
      { shapes: [['tri', 15, 145, 55, 77, 95, 145], ['rect', 47, 138, 16, 28]] },
      { shapes: [['tri', 280, 145, 320, 77, 360, 145], ['rect', 312, 138, 16, 28]] },
      { shapes: [['rect', 15, 465, 360, 74]] },
      { shapes: [['circle', 52, 478, 9], ['circle', 72, 472, 9], ['circle', 62, 488, 8]] },
      { shapes: [['circle', 300, 476, 9], ['circle', 322, 481, 9]] },
    ],
    parts: [
      { shapes: [['circle', 20, 30, 16]] },                         // body
      { shapes: [['circle', 20, 14, 12]] },                         // head
      { shapes: [['circle', 9, 5, 7], ['circle', 31, 5, 7]] },      // ears
      { shapes: [['ellipse', 4, 28, 9, 18], ['ellipse', 36, 28, 9, 18]] }, // arms
      { shapes: [['ellipse', 20, 18, 11, 8]] },                     // muzzle
      { shapes: [['ellipse', 12, 42, 11, 7], ['ellipse', 28, 42, 11, 7]] }, // paws
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x222222, 1);
      g.fillCircle(T(16), Y(12), 2 * s);
      g.fillCircle(T(24), Y(12), 2 * s);
      g.fillCircle(T(20), Y(17), 2.5 * s);
      g.lineStyle(3, 0x222222, 1);
      g.strokePoints([{ x: T(16), y: Y(21) }, { x: T(20), y: Y(23) }, { x: T(24), y: Y(21) }], false);
    },
  },

  // ── Ark ────────────────────────────────────────────────────────────────
  ark: {
    s: 3, ox: 15, oy: 158, tex: 'ark', label: 'The Ark',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 81]] },
      { shapes: [['circle', 330, 110, 24]] },
      { shapes: [['ellipse', 80, 106, 70, 26], ['ellipse', 240, 94, 80, 28]] },
      { shapes: [['rect', 15, 458, 360, 81]] },
    ],
    parts: [
      { shapes: [['rect', 0, 50, 120, 50]] },
      { shapes: [['rect', 5, 55, 110, 40]] },
      { shapes: [['rect', 20, 20, 80, 35], ['rect', 35, 5, 50, 20]] },
      { shapes: [['tri', 15, 20, 105, 20, 60, 2]] },
      { shapes: [
        ['rect', 28, 28, 14, 12], ['rect', 53, 28, 14, 12], ['rect', 78, 28, 14, 12],
      ] },
    ],
    details(g, T, Y, s) {
      g.lineStyle(2, 0x000000, 0.4);
      for (let x = 15; x < 120; x += 15) g.lineBetween(T(x), Y(50), T(x), Y(100));
    },
  },
};

const PAGE_ORDER = ['noah', 'elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear', 'ark'];
const ENV_DEF    = { s: 1, ox: 0, oy: 0 };

export default class ColorScene extends Phaser.Scene {
  constructor() { super('Color'); }

  create() {
    const W = 390, H = 844;
    this._snd     = new SoundManager();
    this._sel     = 0xff3333;
    this._page    = 0;
    this._zones   = [];
    this._olGfx   = null;
    this._refObjs = [];

    this._drawBg(W, H);

    this.add.rectangle(W / 2, 36, W, 72, 0x000000, 0.45).setDepth(10);
    this.add.text(W / 2, 16, 'Coloring Book', {
      fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#ffe066', stroke: '#7a4200', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(11);
    this._subTitle = this.add.text(W / 2, 52, '', {
      fontSize: '16px', fontFamily: 'Arial',
      fill: '#aaffff', stroke: '#002244', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(11);

    const arrow = (x, lbl, dir) => {
      this.add.text(x, 36, lbl, {
        fontSize: '38px', fontFamily: 'Arial', fontStyle: 'bold',
        fill: '#ffcc44', stroke: '#553300', strokeThickness: 4,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11)
        .on('pointerdown', () => {
          this._page = (this._page + dir + PAGE_ORDER.length) % PAGE_ORDER.length;
          this._loadPage();
        });
    };
    arrow(28, '<', -1);
    arrow(W - 28, '>', 1);

    this.add.rectangle(W / 2, 308, 360, 462, 0xfff9ee).setDepth(1);
    const brdr = this.add.graphics().setDepth(2);
    brdr.lineStyle(4, 0xddbb66, 1);
    brdr.strokeRect(15, 77, 360, 462);

    this._buildPalette(W, H);

    const clrBtn = this.add.rectangle(90, H - 32, 130, 44, 0x226622)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(90, H - 32, 'Clear', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#ffffff',
    }).setOrigin(0.5).setDepth(11);
    clrBtn.on('pointerdown', () => this._loadPage());

    const menuBtn = this.add.rectangle(W - 90, H - 32, 140, 44, 0x444466)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(W - 90, H - 32, 'Menu', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#cccccc',
    }).setOrigin(0.5).setDepth(11);
    menuBtn.on('pointerdown', () => this.scene.start('Menu'));

    this._loadPage();
  }

  _drawBg(W, H) {
    this.add.rectangle(W / 2, H / 2, W, H, 0xd4f0ff);
    [[50, 130], [240, 110], [140, 175]].forEach(([x, y]) => {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(x, y, 20); g.fillCircle(x + 24, y - 7, 15); g.fillCircle(x + 44, y, 18);
    });
    const sun = this.add.graphics();
    sun.fillStyle(0xffd700); sun.fillCircle(345, 120, 26);
    sun.fillStyle(0xffee88); sun.fillCircle(345, 120, 17);
    this.add.rectangle(W / 2, H - 14, W, 28, 0x5cb85c);
  }

  _buildPalette(W, H) {
    const COLS = [
      0xff3333, 0xff8800, 0xffee00, 0x33cc33,
      0x2277ff, 0x9933ff, 0xff55cc, 0xffffff,
      0x8B4513, 0x333333, 0x00cccc, 0xffaabb,
    ];
    const sz = 44, gap = 5, perRow = 6;
    const x0 = (390 - (perRow * sz + (perRow - 1) * gap)) / 2 + sz / 2;
    const y0 = H - 148;
    this.add.rectangle(195, H - 118, 390, 122, 0xfff0cc, 0.95).setDepth(9);
    this.add.text(195, H - 192, 'Pick a color, then tap a part:', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#885500',
    }).setOrigin(0.5).setDepth(10);
    this._swatches = COLS.map((color, i) => {
      const col = i % perRow, row = Math.floor(i / perRow);
      const sw  = this.add.rectangle(x0 + col * (sz + gap), y0 + row * (sz + gap), sz - 2, sz - 2, color)
        .setDepth(10).setInteractive({ useHandCursor: true });
      sw.setStrokeStyle(3, 0x333333);
      sw.on('pointerdown', () => { this._sel = color; this._refreshSwatches(); this._snd.tap(); });
      return { sw, color };
    });
    this._refreshSwatches();
  }

  _refreshSwatches() {
    this._swatches.forEach(({ sw, color }) =>
      sw.setStrokeStyle(
        color === this._sel ? 5 : 3,
        color === this._sel ? 0xffffff : 0x333333,
      ));
  }

  // ── Page loading ───────────────────────────────────────────────────────
  _loadPage() {
    this._zones.forEach(z => z.destroy());
    this._zones = [];
    this._refObjs.forEach(o => o.destroy());
    this._refObjs = [];
    if (this._olGfx) { this._olGfx.destroy(); this._olGfx = null; }

    const name = PAGE_ORDER[this._page];
    const def  = PAGES[name];
    this._def  = def;
    this._subTitle.setText(`${def.label}   (${this._page + 1} / ${PAGE_ORDER.length})`);

    if (def.sceneParts) this._processParts(def.sceneParts, ENV_DEF);
    this._processParts(def.parts, def);

    this._olGfx = this.add.graphics().setDepth(6);
    this._redrawOutline();

    const ref = this.add.image(52, 116, def.tex).setDepth(11);
    ref.setScale(Math.min(54 / ref.width, 54 / ref.height));
    const lbl = this.add.text(52, 148, 'In game', {
      fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#885500',
    }).setOrigin(0.5).setDepth(11);
    this._refObjs.push(ref, lbl);
  }

  _processParts(parts, xform) {
    parts.forEach(part => {
      const gfx = this.add.graphics().setDepth(4);
      const paint = (col) => {
        gfx.clear();
        gfx.fillStyle(col, 1);
        const saved = this._def; this._def = xform;
        part.shapes.forEach(sh => this._fillShape(gfx, sh));
        this._def = saved;
      };
      paint(0xffffff);
      this._zones.push(gfx);

      part.shapes.forEach(sh => {
        const hit   = this.add.graphics();
        const saved = this._def; this._def = xform;
        const [geom, contains] = this._geom(sh);
        this._def = saved;
        hit.setInteractive(geom, contains);
        hit.on('pointerdown', () => { paint(this._sel); this._redrawOutline(); this._snd.tap(); });
        this._zones.push(hit);
      });
    });
  }

  // ── Shape helpers ──────────────────────────────────────────────────────
  _t(x)  { return this._def.ox + x * this._def.s; }
  _ty(y) { return this._def.oy + y * this._def.s; }

  _pts(sh) {
    return sh[1].map(([x, y]) => ({ x: this._t(x), y: this._ty(y) }));
  }

  _fillShape(g, sh) {
    const s = this._def.s;
    switch (sh[0]) {
      case 'rect':    g.fillRect(this._t(sh[1]), this._ty(sh[2]), sh[3] * s, sh[4] * s); break;
      case 'circle':  g.fillCircle(this._t(sh[1]), this._ty(sh[2]), sh[3] * s); break;
      case 'ellipse': g.fillEllipse(this._t(sh[1]), this._ty(sh[2]), sh[3] * s, sh[4] * s); break;
      case 'tri':     g.fillTriangle(
        this._t(sh[1]), this._ty(sh[2]), this._t(sh[3]),
        this._ty(sh[4]), this._t(sh[5]), this._ty(sh[6])); break;
      case 'poly':    g.fillPoints(this._pts(sh), true); break;
    }
  }

  _strokeShape(g, sh) {
    const s = this._def.s;
    switch (sh[0]) {
      case 'rect':    g.strokeRect(this._t(sh[1]), this._ty(sh[2]), sh[3] * s, sh[4] * s); break;
      case 'circle':  g.strokeCircle(this._t(sh[1]), this._ty(sh[2]), sh[3] * s); break;
      case 'ellipse': g.strokeEllipse(this._t(sh[1]), this._ty(sh[2]), sh[3] * s, sh[4] * s); break;
      case 'tri':     g.strokeTriangle(
        this._t(sh[1]), this._ty(sh[2]), this._t(sh[3]),
        this._ty(sh[4]), this._t(sh[5]), this._ty(sh[6])); break;
      case 'poly':    g.strokePoints(this._pts(sh), true); break;
    }
  }

  _geom(sh) {
    const s = this._def.s;
    switch (sh[0]) {
      case 'rect': return [
        new Phaser.Geom.Rectangle(this._t(sh[1]), this._ty(sh[2]), sh[3] * s, sh[4] * s),
        Phaser.Geom.Rectangle.Contains,
      ];
      case 'circle': return [
        new Phaser.Geom.Circle(this._t(sh[1]), this._ty(sh[2]), Math.max(sh[3] * s, 18)),
        Phaser.Geom.Circle.Contains,
      ];
      case 'ellipse': return [
        new Phaser.Geom.Ellipse(this._t(sh[1]), this._ty(sh[2]), sh[3] * s, sh[4] * s),
        Phaser.Geom.Ellipse.Contains,
      ];
      case 'tri': return [
        new Phaser.Geom.Triangle(
          this._t(sh[1]), this._ty(sh[2]), this._t(sh[3]),
          this._ty(sh[4]), this._t(sh[5]), this._ty(sh[6])),
        Phaser.Geom.Triangle.Contains,
      ];
      case 'poly': return [
        new Phaser.Geom.Polygon(this._pts(sh)),
        Phaser.Geom.Polygon.Contains,
      ];
    }
  }

  _redrawOutline() {
    const g   = this._olGfx;
    const def = this._def;
    g.clear();

    if (def.sceneParts) {
      const saved = this._def;
      this._def = ENV_DEF;
      def.sceneParts.forEach(part =>
        part.shapes.forEach(sh => { g.lineStyle(2, 0x000000, 0.5); this._strokeShape(g, sh); }));
      this._def = saved;
    }

    def.parts.forEach(part =>
      part.shapes.forEach(sh => { g.lineStyle(3, 0x000000, 1); this._strokeShape(g, sh); }));

    if (def.details) {
      def.details(g, (x) => this._t(x), (y) => this._ty(y), def.s);
    }
  }
}
