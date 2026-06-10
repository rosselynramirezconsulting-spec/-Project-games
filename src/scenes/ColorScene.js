import SoundManager from '../utils/SoundManager.js';

// sceneParts use absolute screen coordinates (s=1, ox=0, oy=0).
// Animal parts use per-page s/ox/oy transform.
// Parchment: x 15–375, y 77–539.
// Animal zone (s=8, ox=35, oy=145): y 145–465, x 35–355.
// Sky strip: y 77–145.  Ground strip: y 465–539.

const PAGES = {
  noah: {
    s: 6, ox: 66, oy: 127, tex: 'noah', label: 'Noah',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 50]] },             // sky
      { shapes: [['circle', 330, 99, 18]] },               // sun
      { shapes: [['rect', 15, 511, 360, 28]] },            // ground
    ],
    parts: [
      { shapes: [['rect', 14, 28, 20, 26]] },
      { shapes: [['rect', 10, 30, 28, 24], ['tri', 10, 54, 38, 54, 24, 64]] },
      { shapes: [['circle', 24, 18, 14]] },
      { shapes: [['tri', 16, 26, 32, 26, 24, 38]] },
      { shapes: [['rect', 12, 6, 24, 10], ['rect', 10, 4, 28, 8]] },
      { shapes: [['rect', 37, 20, 5, 44]] },
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(20), Y(16), 2 * s);
      g.fillCircle(T(28), Y(16), 2 * s);
      g.lineStyle(5, 0x000000, 1);
      g.strokePoints([{ x: T(20), y: Y(22) }, { x: T(24), y: Y(25) }, { x: T(28), y: Y(22) }], false);
    },
  },

  elephant: {
    s: 8, ox: 35, oy: 145, tex: 'elephant', label: 'Elephant',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },             // savanna sky
      { shapes: [['circle', 330, 104, 20]] },              // sun
      { shapes: [['rect', 307, 92, 14, 153]] },            // acacia trunk
      { shapes: [['ellipse', 314, 108, 90, 32]] },         // acacia flat canopy
      { shapes: [['rect', 15, 465, 360, 74]] },            // savanna ground
      { shapes: [['ellipse', 102, 492, 82, 22]] },         // water puddle
    ],
    parts: [
      { shapes: [['circle', 20, 20, 14]] },                // body
      { shapes: [['circle', 20, 8, 9]] },                  // head
      { shapes: [['ellipse', 10, 6, 8, 10]] },             // ear
      { shapes: [['rect', 12, 14, 4, 14]] },               // trunk
      { shapes: [['rect', 33, 18, 3, 10]] },               // tail
      { shapes: [['rect', 8, 30, 5, 10], ['rect', 14, 30, 5, 10],
                 ['rect', 22, 30, 5, 10], ['rect', 28, 30, 5, 10]] }, // 4 legs
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(8), 2 * s);
    },
  },

  giraffe: {
    s: 8, ox: 35, oy: 145, tex: 'giraffe', label: 'Giraffe',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },             // sky
      { shapes: [['circle', 55, 104, 20]] },               // sun (left)
      { shapes: [['rect', 318, 82, 14, 185]] },            // tall tree trunk
      { shapes: [['circle', 325, 100, 44]] },              // tree canopy
      { shapes: [['rect', 15, 465, 360, 74]] },            // ground
      { shapes: [['rect', 15, 454, 360, 13]] },            // grass strip
    ],
    parts: [
      { shapes: [['rect', 10, 20, 20, 18]] },              // body
      { shapes: [['rect', 17, 4, 7, 20]] },                // neck
      { shapes: [['rect', 20, 0, 12, 8]] },                // head
      { shapes: [['rect', 22, -1, 3, 5], ['rect', 28, -1, 3, 5]] }, // ossicones
      { shapes: [['rect', 12, 22, 5, 5], ['rect', 22, 26, 5, 5], ['rect', 13, 30, 5, 5]] }, // spots
      { shapes: [['rect', 11, 37, 4, 12], ['rect', 17, 37, 4, 12],
                 ['rect', 23, 37, 4, 12], ['rect', 29, 37, 4, 12]] }, // 4 legs
      { shapes: [['rect', 29, 23, 2, 10]] },               // tail
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(24), Y(4), 2 * s);
    },
  },

  lion: {
    s: 8, ox: 35, oy: 145, tex: 'lion', label: 'Lion',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },             // sunset sky
      { shapes: [['rect', 15, 454, 360, 13]] },            // grass strip
      { shapes: [['circle', 55, 468, 28]] },               // rock left
      { shapes: [['circle', 335, 468, 24]] },              // rock right
      { shapes: [['rect', 15, 465, 360, 74]] },            // ground
    ],
    parts: [
      { shapes: [['circle', 20, 20, 18]] },                // mane
      { shapes: [['ellipse', 20, 33, 22, 16]] },           // body
      { shapes: [['circle', 20, 20, 13]] },                // face
      { shapes: [['circle', 20, 22, 4]] },                 // nose
      { shapes: [['rect', 37, 24, 4, 14]] },               // tail
      { shapes: [['circle', 39, 38, 6]] },                 // tail tuft
      { shapes: [['ellipse', 12, 38, 10, 6], ['ellipse', 28, 38, 10, 6]] }, // paws
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(16), Y(17), 2 * s);
      g.fillCircle(T(24), Y(17), 2 * s);
    },
  },

  zebra: {
    s: 8, ox: 35, oy: 145, tex: 'zebra', label: 'Zebra',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },             // sky
      { shapes: [['tri', 15, 145, 120, 77, 225, 145]] },   // mountain left
      { shapes: [['tri', 165, 145, 270, 77, 375, 145]] },  // mountain right
      { shapes: [['rect', 15, 454, 52, 18], ['rect', 78, 449, 42, 23],
                 ['rect', 298, 451, 47, 21], ['rect', 338, 455, 37, 17]] }, // tall grass
      { shapes: [['rect', 15, 465, 360, 74]] },            // ground
    ],
    parts: [
      { shapes: [['rect', 8, 14, 24, 20], ['circle', 20, 10, 9]] }, // body + head
      { shapes: [
        ['rect', 10, 16, 3, 16], ['rect', 16, 14, 3, 18],
        ['rect', 22, 14, 3, 18], ['rect', 28, 16, 3, 16],
      ] },                                                 // stripes
      { shapes: [['rect', 18, 2, 4, 14]] },                // mane
      { shapes: [['rect', 9, 33, 4, 10], ['rect', 15, 33, 4, 10],
                 ['rect', 22, 33, 4, 10], ['rect', 28, 33, 4, 10]] }, // 4 legs
      { shapes: [['rect', 31, 17, 2, 10], ['circle', 31, 27, 4]] }, // tail + tuft
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(10), 2 * s);
      g.fillCircle(T(23), Y(10), 2 * s);
    },
  },

  monkey: {
    s: 8, ox: 35, oy: 145, tex: 'monkey', label: 'Monkey',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },             // jungle sky
      { shapes: [['rect', 15, 90, 26, 385]] },             // left trunk
      { shapes: [['circle', 28, 110, 36], ['circle', 28, 200, 28], ['circle', 28, 290, 24]] }, // left leaves
      { shapes: [['rect', 349, 90, 26, 385]] },            // right trunk
      { shapes: [['circle', 362, 110, 36], ['circle', 362, 200, 28], ['circle', 362, 290, 24]] }, // right leaves
      { shapes: [['rect', 40, 212, 310, 12]] },            // branch
      { shapes: [['rect', 15, 465, 360, 74]] },            // jungle floor
    ],
    parts: [
      { shapes: [['circle', 20, 18, 13]] },                // head
      { shapes: [['ellipse', 20, 30, 16, 14]] },           // body
      { shapes: [['rect', 5, 24, 8, 5], ['rect', 27, 24, 8, 5]] }, // arms
      { shapes: [
        ['ellipse', 20, 22, 12, 10], ['circle', 8, 16, 6],
        ['circle', 32, 16, 6], ['ellipse', 20, 25, 8, 5],
      ] },                                                 // face + ears + mouth
      { shapes: [['rect', 29, 30, 3, 12]] },               // tail
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(18), 2 * s);
      g.fillCircle(T(23), Y(18), 2 * s);
    },
  },

  rabbit: {
    s: 8, ox: 35, oy: 145, tex: 'rabbit', label: 'Rabbit',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },             // meadow sky
      { shapes: [['circle', 330, 104, 20]] },              // sun
      { shapes: [['rect', 15, 465, 360, 74]] },            // meadow ground
      { shapes: [['circle', 58, 483, 16], ['circle', 92, 476, 12]] },   // flowers left
      { shapes: [['circle', 293, 480, 14], ['circle', 335, 477, 16]] }, // flowers right
      { shapes: [['tri', 252, 462, 272, 462, 262, 480]] }, // carrot
    ],
    parts: [
      { shapes: [
        ['circle', 20, 24, 13], ['circle', 20, 12, 9],
        ['rect', 14, 0, 6, 14], ['rect', 22, 0, 6, 14],
      ] },                                                 // body + head + ears
      { shapes: [['rect', 15, 1, 4, 11], ['rect', 23, 1, 4, 11]] }, // inner ears
      { shapes: [['circle', 20, 17, 2]] },                 // nose
      { shapes: [['ellipse', 14, 36, 14, 8], ['ellipse', 26, 36, 14, 8]] }, // feet
      { shapes: [['circle', 30, 26, 5]] },                 // tail
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(12), 2 * s);
      g.fillCircle(T(23), Y(12), 2 * s);
    },
  },

  penguin: {
    s: 8, ox: 35, oy: 145, tex: 'penguin', label: 'Penguin',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },             // arctic sky
      { shapes: [['tri', 15, 145, 80, 77, 145, 145]] },    // iceberg left
      { shapes: [['tri', 230, 145, 295, 80, 360, 145]] },  // iceberg right
      { shapes: [['rect', 15, 453, 55, 50], ['rect', 310, 450, 55, 54]] }, // ice blocks
      { shapes: [['rect', 15, 465, 360, 40]] },            // ice ground
      { shapes: [['rect', 15, 500, 360, 39]] },            // ocean
    ],
    parts: [
      { shapes: [['ellipse', 20, 22, 22, 28]] },           // body
      { shapes: [['ellipse', 8, 22, 8, 18], ['ellipse', 32, 22, 8, 18]] }, // flippers
      { shapes: [['ellipse', 20, 24, 14, 20]] },           // belly
      { shapes: [['circle', 20, 10, 9]] },                 // head
      { shapes: [['tri', 17, 14, 23, 14, 20, 19]] },       // beak
    ],
    details(g, T, Y, s) {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(T(17), Y(10), 3 * s);
      g.fillCircle(T(23), Y(10), 3 * s);
      g.lineStyle(3, 0x000000, 1);
      g.strokeCircle(T(17), Y(10), 3 * s);
      g.strokeCircle(T(23), Y(10), 3 * s);
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(10), 2 * s);
      g.fillCircle(T(23), Y(10), 2 * s);
    },
  },

  bear: {
    s: 8, ox: 35, oy: 145, tex: 'bear', label: 'Bear',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 68]] },             // forest sky
      { shapes: [['tri', 15, 145, 55, 77, 95, 145], ['rect', 47, 138, 16, 28]] }, // left pine
      { shapes: [['tri', 280, 145, 320, 77, 360, 145], ['rect', 312, 138, 16, 28]] }, // right pine
      { shapes: [['rect', 15, 465, 360, 74]] },            // forest floor
      { shapes: [['circle', 52, 478, 9], ['circle', 72, 472, 9], ['circle', 62, 488, 8]] }, // berries L
      { shapes: [['circle', 300, 476, 9], ['circle', 322, 481, 9]] },                       // berries R
    ],
    parts: [
      { shapes: [
        ['circle', 20, 22, 15], ['circle', 20, 10, 10],
        ['circle', 10, 6, 7], ['circle', 30, 6, 7],
      ] },                                                 // body + head + ears
      { shapes: [['ellipse', 6, 24, 10, 18], ['ellipse', 34, 24, 10, 18]] }, // arms
      { shapes: [['ellipse', 20, 24, 10, 8]] },            // muzzle
      { shapes: [['ellipse', 13, 36, 12, 8], ['ellipse', 27, 36, 12, 8]] }, // hind paws
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(10), 2 * s);
      g.fillCircle(T(23), Y(10), 2 * s);
      g.fillCircle(T(20), Y(14), 2 * s);
    },
  },

  ark: {
    s: 3, ox: 15, oy: 158, tex: 'ark', label: 'The Ark',
    sceneParts: [
      { shapes: [['rect', 15, 77, 360, 81]] },             // sky
      { shapes: [['circle', 330, 110, 24]] },              // sun
      { shapes: [['ellipse', 80, 106, 70, 26], ['ellipse', 240, 94, 80, 28]] }, // clouds
      { shapes: [['rect', 15, 458, 360, 81]] },            // ocean
    ],
    parts: [
      { shapes: [['rect', 0, 50, 120, 50]] },              // hull
      { shapes: [['rect', 5, 55, 110, 40]] },              // hull planking
      { shapes: [['rect', 20, 20, 80, 35], ['rect', 35, 5, 50, 20]] }, // cabin
      { shapes: [['tri', 15, 20, 105, 20, 60, 2]] },       // roof
      { shapes: [
        ['rect', 28, 28, 14, 12], ['rect', 53, 28, 14, 12], ['rect', 78, 28, 14, 12],
      ] },                                                 // windows
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
    this._snd   = new SoundManager();
    this._sel   = 0xff3333;
    this._page  = 0;
    this._zones = [];
    this._olGfx = null;
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

    // Parchment
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
      const sw = this.add.rectangle(x0 + col * (sz + gap), y0 + row * (sz + gap), sz - 2, sz - 2, color)
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

    // Environment parts drawn first (behind animal)
    if (def.sceneParts) this._processParts(def.sceneParts, ENV_DEF);

    // Animal colorable parts
    this._processParts(def.parts, def);

    this._olGfx = this.add.graphics().setDepth(6);
    this._redrawOutline();

    // In-game sprite as reference
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
        const hit  = this.add.graphics();
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

  _fillShape(g, sh) {
    const s = this._def.s;
    switch (sh[0]) {
      case 'rect':    g.fillRect(this._t(sh[1]), this._ty(sh[2]), sh[3] * s, sh[4] * s); break;
      case 'circle':  g.fillCircle(this._t(sh[1]), this._ty(sh[2]), sh[3] * s); break;
      case 'ellipse': g.fillEllipse(this._t(sh[1]), this._ty(sh[2]), sh[3] * s, sh[4] * s); break;
      case 'tri':     g.fillTriangle(
        this._t(sh[1]), this._ty(sh[2]), this._t(sh[3]),
        this._ty(sh[4]), this._t(sh[5]), this._ty(sh[6])); break;
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
    }
  }

  _redrawOutline() {
    const g   = this._olGfx;
    const def = this._def;
    g.clear();

    // Environment outlines (thin)
    if (def.sceneParts) {
      const saved = this._def;
      this._def = ENV_DEF;
      def.sceneParts.forEach(part =>
        part.shapes.forEach(sh => {
          g.lineStyle(2, 0x000000, 0.5);
          this._strokeShape(g, sh);
        }));
      this._def = saved;
    }

    // Animal outlines (thick)
    def.parts.forEach(part =>
      part.shapes.forEach(sh => {
        g.lineStyle(3, 0x000000, 1);
        this._strokeShape(g, sh);
      }));

    if (def.details) {
      def.details(g, (x) => this._t(x), (y) => this._ty(y), def.s);
    }
  }
}
