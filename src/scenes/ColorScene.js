import SoundManager from '../utils/SoundManager.js';

// Each coloring page is built from the EXACT same shapes the game uses to
// draw its sprites (see utils/Graphics.js drawAnimal/drawNoah/drawArk),
// scaled up to fit the parchment. Coordinates below are in original
// sprite space; `s` is the scale and `ox/oy` the parchment offset.
//
// Shapes: ['rect',x,y,w,h] ['circle',cx,cy,r] ['ellipse',cx,cy,w,h]
//         ['tri',x1,y1,x2,y2,x3,y3]
// Parts are listed in the sprite's paint order, so overlaps layer the
// same way they do in the game. Fixed details (eyes, smiles, planks)
// are drawn on the outline layer and are not colorable — same as the game.
const PAGES = {
  noah: {
    s: 7, ox: 27, oy: 84, tex: 'noah', label: 'Noah',
    parts: [
      { shapes: [['rect', 14, 28, 20, 26]] },                                  // body
      { shapes: [['rect', 10, 30, 28, 24], ['tri', 10, 54, 38, 54, 24, 64]] }, // robe
      { shapes: [['circle', 24, 18, 14]] },                                    // head
      { shapes: [['tri', 16, 26, 32, 26, 24, 38]] },                           // beard
      { shapes: [['rect', 12, 6, 24, 10], ['rect', 10, 4, 28, 8]] },           // hat
      { shapes: [['rect', 37, 20, 5, 44]] },                                   // staff
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(20), Y(16), 2 * s);
      g.fillCircle(T(28), Y(16), 2 * s);
      g.lineStyle(5, 0x000000, 1);
      g.strokePoints([
        { x: T(20), y: Y(22) }, { x: T(24), y: Y(25) }, { x: T(28), y: Y(22) },
      ], false);
    },
  },

  elephant: {
    s: 9, ox: 15, oy: 128, tex: 'elephant', label: 'Elephant',
    parts: [
      { shapes: [['circle', 20, 20, 14]] },                                          // body
      { shapes: [['circle', 20, 8, 9]] },                                            // head
      { shapes: [['rect', 12, 14, 4, 14], ['rect', 8, 30, 6, 10], ['rect', 26, 30, 6, 10]] }, // trunk + legs
      { shapes: [['ellipse', 10, 6, 8, 10]] },                                       // ear
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(8), 2 * s);
    },
  },

  giraffe: {
    s: 9, ox: 15, oy: 128, tex: 'giraffe', label: 'Giraffe',
    parts: [
      { shapes: [['rect', 10, 20, 20, 18]] }, // body
      { shapes: [['rect', 17, 4, 7, 20]] },   // neck
      { shapes: [['rect', 20, 0, 12, 8]] },   // head
      { shapes: [['rect', 12, 22, 5, 5], ['rect', 22, 26, 5, 5], ['rect', 13, 30, 5, 5]] }, // spots
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(24), Y(4), 2 * s);
    },
  },

  lion: {
    s: 9, ox: 15, oy: 128, tex: 'lion', label: 'Lion',
    parts: [
      { shapes: [['circle', 20, 20, 18]] }, // mane
      { shapes: [['circle', 20, 20, 13]] }, // face
      { shapes: [['circle', 20, 22, 4]] },  // nose
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(16), Y(17), 2 * s);
      g.fillCircle(T(24), Y(17), 2 * s);
    },
  },

  zebra: {
    s: 9, ox: 15, oy: 128, tex: 'zebra', label: 'Zebra',
    parts: [
      { shapes: [['rect', 8, 14, 24, 20], ['circle', 20, 10, 9]] }, // body + head
      { shapes: [
        ['rect', 10, 16, 3, 16], ['rect', 16, 14, 3, 18],
        ['rect', 22, 14, 3, 18], ['rect', 28, 16, 3, 16],
      ] }, // stripes
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(10), 2 * s);
      g.fillCircle(T(23), Y(10), 2 * s);
    },
  },

  monkey: {
    s: 9, ox: 15, oy: 128, tex: 'monkey', label: 'Monkey',
    parts: [
      { shapes: [['circle', 20, 18, 13]] }, // head
      { shapes: [
        ['ellipse', 20, 22, 12, 10], ['circle', 8, 16, 6],
        ['circle', 32, 16, 6], ['ellipse', 20, 25, 8, 5],
      ] }, // face + ears + mouth
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(18), 2 * s);
      g.fillCircle(T(23), Y(18), 2 * s);
    },
  },

  rabbit: {
    s: 9, ox: 15, oy: 128, tex: 'rabbit', label: 'Rabbit',
    parts: [
      { shapes: [
        ['circle', 20, 24, 13], ['circle', 20, 12, 9],
        ['rect', 14, 0, 6, 14], ['rect', 22, 0, 6, 14],
      ] }, // body + head + ears
      { shapes: [['rect', 15, 1, 4, 11], ['rect', 23, 1, 4, 11]] }, // inner ears
      { shapes: [['circle', 20, 17, 2]] },                          // nose
    ],
    details(g, T, Y, s) {
      g.fillStyle(0x000000, 1);
      g.fillCircle(T(17), Y(12), 2 * s);
      g.fillCircle(T(23), Y(12), 2 * s);
    },
  },

  penguin: {
    s: 9, ox: 15, oy: 128, tex: 'penguin', label: 'Penguin',
    parts: [
      { shapes: [['ellipse', 20, 22, 22, 28]] },    // body
      { shapes: [['ellipse', 20, 24, 14, 20]] },    // belly
      { shapes: [['circle', 20, 10, 9]] },          // head
      { shapes: [['tri', 17, 14, 23, 14, 20, 19]] }, // beak
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
    s: 9, ox: 15, oy: 128, tex: 'bear', label: 'Bear',
    parts: [
      { shapes: [
        ['circle', 20, 22, 15], ['circle', 20, 10, 10],
        ['circle', 10, 6, 7], ['circle', 30, 6, 7],
      ] }, // body + head + ears
      { shapes: [['ellipse', 20, 24, 10, 8]] }, // muzzle
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
    parts: [
      { shapes: [['rect', 0, 50, 120, 50]] },                       // hull
      { shapes: [['rect', 5, 55, 110, 40]] },                       // hull planking
      { shapes: [['rect', 20, 20, 80, 35], ['rect', 35, 5, 50, 20]] }, // cabin
      { shapes: [['tri', 15, 20, 105, 20, 60, 2]] },                // roof
      { shapes: [
        ['rect', 28, 28, 14, 12], ['rect', 53, 28, 14, 12], ['rect', 78, 28, 14, 12],
      ] }, // windows
    ],
    details(g, T, Y, s) {
      g.lineStyle(2, 0x000000, 0.4);
      for (let x = 15; x < 120; x += 15) {
        g.lineBetween(T(x), Y(50), T(x), Y(100));
      }
    },
  },
};

const PAGE_ORDER = ['noah', 'elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear', 'ark'];

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

    // Colorable parts — same shapes & paint order as the in-game sprite
    def.parts.forEach((part) => {
      const gfx = this.add.graphics().setDepth(4);
      const paint = (col) => {
        gfx.clear();
        gfx.fillStyle(col, 1);
        part.shapes.forEach(sh => this._fillShape(gfx, sh));
      };
      paint(0xffffff);
      this._zones.push(gfx);

      part.shapes.forEach((sh) => {
        const hit = this.add.graphics();
        const [geom, contains] = this._geom(sh);
        hit.setInteractive(geom, contains);
        hit.on('pointerdown', () => {
          paint(this._sel);
          this._redrawOutline();
          this._snd.tap();
        });
        this._zones.push(hit);
      });
    });

    this._olGfx = this.add.graphics().setDepth(6);
    this._redrawOutline();

    // The actual in-game sprite as a reference model
    const ref = this.add.image(52, 116, def.tex).setDepth(11);
    ref.setScale(Math.min(54 / ref.width, 54 / ref.height));
    const lbl = this.add.text(52, 148, 'In game', {
      fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#885500',
    }).setOrigin(0.5).setDepth(11);
    this._refObjs.push(ref, lbl);
  }

  // ── Shape helpers (transform sprite-space coords to parchment space) ──
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
        this._ty(sh[4]), this._t(sh[5]), this._ty(sh[6]),
      ); break;
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
        this._ty(sh[4]), this._t(sh[5]), this._ty(sh[6]),
      ); break;
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
          this._ty(sh[4]), this._t(sh[5]), this._ty(sh[6]),
        ),
        Phaser.Geom.Triangle.Contains,
      ];
    }
  }

  _redrawOutline() {
    const g = this._olGfx;
    g.clear();
    g.lineStyle(3, 0x000000, 1);
    this._def.parts.forEach(part =>
      part.shapes.forEach((sh) => {
        g.lineStyle(3, 0x000000, 1);
        this._strokeShape(g, sh);
      }));
    if (this._def.details) {
      this._def.details(g, (x) => this._t(x), (y) => this._ty(y), this._def.s);
    }
  }
}
