export default class ColorScene extends Phaser.Scene {
  constructor() { super('Color'); }

  create() {
    const W = 390, H = 844;
    this._sel   = 0xff3333;
    this._page  = 0;
    this._pages = ['noah', 'elephant', 'lion', 'rabbit', 'ark'];
    this._zones = [];

    this._drawBg(W, H);

    // Header
    this.add.rectangle(W / 2, 36, W, 72, 0x000000, 0.45).setDepth(10);
    this.add.text(W / 2, 16, 'Coloring Book', {
      fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#ffe066', stroke: '#7a4200', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(11);
    this._subTitle = this.add.text(W / 2, 52, '', {
      fontSize: '16px', fontFamily: 'Arial',
      fill: '#aaffff', stroke: '#002244', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(11);

    // Nav arrows
    const arrow = (x, lbl, dir) => {
      this.add.text(x, 36, lbl, {
        fontSize: '38px', fontFamily: 'Arial', fontStyle: 'bold',
        fill: '#ffcc44', stroke: '#553300', strokeThickness: 4,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11)
        .on('pointerdown', () => {
          this._page = (this._page + dir + this._pages.length) % this._pages.length;
          this._loadPage();
        });
    };
    arrow(28, '<', -1);
    arrow(W - 28, '>', 1);

    // White coloring area
    this.add.rectangle(W / 2, 308, 360, 462, 0xffffff).setDepth(1);
    const brdr = this.add.graphics().setDepth(2);
    brdr.lineStyle(4, 0xddbb66, 1);
    brdr.strokeRect(15, 77, 360, 462);

    // Color palette
    this._buildPalette(W, H);

    // Clear button
    const clrBtn = this.add.rectangle(90, H - 32, 130, 44, 0x226622)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(90, H - 32, 'Clear', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#ffffff',
    }).setOrigin(0.5).setDepth(11);
    clrBtn.on('pointerdown', () => this._loadPage());

    // Menu button
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
    const totalW = perRow * sz + (perRow - 1) * gap;
    const x0 = (W - totalW) / 2 + sz / 2;
    const y0 = H - 148;

    this.add.rectangle(W / 2, H - 118, W, 122, 0xfff0cc, 0.95).setDepth(9);
    this.add.text(W / 2, H - 192, 'Tap a part, then pick a color:', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#885500',
    }).setOrigin(0.5).setDepth(10);

    this._swatches = COLS.map((color, i) => {
      const col = i % perRow, row = Math.floor(i / perRow);
      const x = x0 + col * (sz + gap);
      const y = y0 + row * (sz + gap);
      const sw = this.add.rectangle(x, y, sz - 2, sz - 2, color)
        .setDepth(10).setInteractive({ useHandCursor: true });
      sw.setStrokeStyle(3, 0x333333);
      sw.on('pointerdown', () => { this._sel = color; this._refreshSwatches(); });
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

    const LABELS = ['Noah', 'Elephant', 'Lion', 'Rabbit', 'The Ark'];
    this._subTitle.setText(`${LABELS[this._page]}   (${this._page + 1} / ${this._pages.length})`);

    const page = this._pages[this._page];
    const cfg  = {
      noah:     { tw: 48,  th: 64,  cx: 195, cy: 295, S: 4.0 },
      elephant: { tw: 40,  th: 40,  cx: 195, cy: 305, S: 5.0 },
      lion:     { tw: 40,  th: 40,  cx: 195, cy: 295, S: 5.0 },
      rabbit:   { tw: 40,  th: 40,  cx: 195, cy: 295, S: 5.0 },
      ark:      { tw: 120, th: 100, cx: 195, cy: 305, S: 2.8 },
    }[page];

    const { tw, th, cx, cy, S } = cfg;
    const tx = lx => cx + (lx - tw / 2) * S;
    const ty = ly => cy + (ly - th / 2) * S;
    const ts = v  => v * S;

    ({
      noah:     () => this._pageNoah(tx, ty, ts),
      elephant: () => this._pageElephant(tx, ty, ts),
      lion:     () => this._pageLion(tx, ty, ts),
      rabbit:   () => this._pageRabbit(tx, ty, ts),
      ark:      () => this._pageArk(tx, ty, ts),
    })[page]?.();
  }

  // Zone: starts white, fills with selected color on tap
  _z(drawFn, geom, geomContains) {
    const gfx = this.add.graphics().setDepth(4);
    let color = 0xffffff;
    const redraw = () => { gfx.clear(); drawFn(gfx, color); };
    redraw();
    gfx.setInteractive(geom, geomContains);
    gfx.on('pointerdown', () => { color = this._sel; redraw(); });
    this._zones.push(gfx);
    return gfx;
  }

  // ── Noah  (48×64) ─────────────────────────────────────────────────────
  _pageNoah(tx, ty, ts) {
    // Robe + skirt
    this._z((g, c) => {
      g.fillStyle(c);
      g.fillRect(tx(10), ty(30), ts(28), ts(24));
      g.fillTriangle(tx(10), ty(54), tx(38), ty(54), tx(24), ty(64));
      g.lineStyle(3, 0x222222);
      g.strokeRect(tx(10), ty(30), ts(28), ts(24));
      g.strokePoints([{x:tx(10),y:ty(54)},{x:tx(38),y:ty(54)},{x:tx(24),y:ty(64)}], true);
    }, new Phaser.Geom.Rectangle(tx(10), ty(30), ts(28), ts(34)), Phaser.Geom.Rectangle.Contains);

    // Face
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(tx(24), ty(18), ts(14));
      g.lineStyle(3, 0x222222); g.strokeCircle(tx(24), ty(18), ts(14));
    }, new Phaser.Geom.Circle(tx(24), ty(18), ts(14)), Phaser.Geom.Circle.Contains);

    // Beard
    this._z((g, c) => {
      g.fillStyle(c);
      g.fillTriangle(tx(16), ty(26), tx(32), ty(26), tx(24), ty(38));
      g.lineStyle(3, 0x222222);
      g.strokePoints([{x:tx(16),y:ty(26)},{x:tx(32),y:ty(26)},{x:tx(24),y:ty(38)}], true);
    }, new Phaser.Geom.Triangle(tx(16), ty(26), tx(32), ty(26), tx(24), ty(38)), Phaser.Geom.Triangle.Contains);

    // Hat
    this._z((g, c) => {
      g.fillStyle(c); g.fillRect(tx(10), ty(4), ts(28), ts(14));
      g.lineStyle(3, 0x222222); g.strokeRect(tx(10), ty(4), ts(28), ts(14));
    }, new Phaser.Geom.Rectangle(tx(10), ty(4), ts(28), ts(14)), Phaser.Geom.Rectangle.Contains);
  }

  // ── Elephant  (40×40) ─────────────────────────────────────────────────
  _pageElephant(tx, ty, ts) {
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(tx(20), ty(20), ts(14));
      g.lineStyle(3, 0x222222); g.strokeCircle(tx(20), ty(20), ts(14));
    }, new Phaser.Geom.Circle(tx(20), ty(20), ts(14)), Phaser.Geom.Circle.Contains);

    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(tx(20), ty(8), ts(9));
      g.lineStyle(3, 0x222222); g.strokeCircle(tx(20), ty(8), ts(9));
    }, new Phaser.Geom.Circle(tx(20), ty(8), ts(9)), Phaser.Geom.Circle.Contains);

    this._z((g, c) => {
      g.fillStyle(c); g.fillRect(tx(12), ty(14), ts(4), ts(14));
      g.lineStyle(3, 0x222222); g.strokeRect(tx(12), ty(14), ts(4), ts(14));
    }, new Phaser.Geom.Rectangle(tx(12), ty(14), ts(4), ts(14)), Phaser.Geom.Rectangle.Contains);

    this._z((g, c) => {
      g.fillStyle(c); g.fillEllipse(tx(10), ty(6), ts(8), ts(10));
      g.lineStyle(3, 0x222222); g.strokeEllipse(tx(10), ty(6), ts(8), ts(10));
    }, new Phaser.Geom.Ellipse(tx(10), ty(6), ts(8), ts(10)), Phaser.Geom.Ellipse.Contains);

    this._z((g, c) => {
      g.fillStyle(c);
      g.fillRect(tx(8), ty(30), ts(6), ts(10));
      g.fillRect(tx(26), ty(30), ts(6), ts(10));
      g.lineStyle(3, 0x222222);
      g.strokeRect(tx(8), ty(30), ts(6), ts(10));
      g.strokeRect(tx(26), ty(30), ts(6), ts(10));
    }, new Phaser.Geom.Rectangle(tx(8), ty(30), ts(24), ts(10)), Phaser.Geom.Rectangle.Contains);
  }

  // ── Lion  (40×40) ─────────────────────────────────────────────────────
  _pageLion(tx, ty, ts) {
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(tx(20), ty(20), ts(18));
      g.lineStyle(3, 0x222222); g.strokeCircle(tx(20), ty(20), ts(18));
    }, new Phaser.Geom.Circle(tx(20), ty(20), ts(18)), Phaser.Geom.Circle.Contains);

    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(tx(20), ty(20), ts(13));
      g.lineStyle(3, 0x222222); g.strokeCircle(tx(20), ty(20), ts(13));
    }, new Phaser.Geom.Circle(tx(20), ty(20), ts(13)), Phaser.Geom.Circle.Contains);

    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(tx(20), ty(22), ts(4));
      g.lineStyle(3, 0x222222); g.strokeCircle(tx(20), ty(22), ts(4));
    }, new Phaser.Geom.Circle(tx(20), ty(22), ts(4)), Phaser.Geom.Circle.Contains);
  }

  // ── Rabbit  (40×40) ───────────────────────────────────────────────────
  _pageRabbit(tx, ty, ts) {
    this._z((g, c) => {
      g.fillStyle(c);
      g.fillRect(tx(14), ty(0), ts(6), ts(14));
      g.fillRect(tx(22), ty(0), ts(6), ts(14));
      g.lineStyle(3, 0x222222);
      g.strokeRect(tx(14), ty(0), ts(6), ts(14));
      g.strokeRect(tx(22), ty(0), ts(6), ts(14));
    }, new Phaser.Geom.Rectangle(tx(14), ty(0), ts(14), ts(14)), Phaser.Geom.Rectangle.Contains);

    this._z((g, c) => {
      g.fillStyle(c);
      g.fillRect(tx(15), ty(1), ts(4), ts(11));
      g.fillRect(tx(23), ty(1), ts(4), ts(11));
      g.lineStyle(3, 0x222222);
      g.strokeRect(tx(15), ty(1), ts(4), ts(11));
      g.strokeRect(tx(23), ty(1), ts(4), ts(11));
    }, new Phaser.Geom.Rectangle(tx(15), ty(1), ts(12), ts(11)), Phaser.Geom.Rectangle.Contains);

    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(tx(20), ty(12), ts(9));
      g.lineStyle(3, 0x222222); g.strokeCircle(tx(20), ty(12), ts(9));
    }, new Phaser.Geom.Circle(tx(20), ty(12), ts(9)), Phaser.Geom.Circle.Contains);

    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(tx(20), ty(24), ts(13));
      g.lineStyle(3, 0x222222); g.strokeCircle(tx(20), ty(24), ts(13));
    }, new Phaser.Geom.Circle(tx(20), ty(24), ts(13)), Phaser.Geom.Circle.Contains);

    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(tx(20), ty(17), ts(2));
      g.lineStyle(3, 0x222222); g.strokeCircle(tx(20), ty(17), ts(2));
    }, new Phaser.Geom.Circle(tx(20), ty(17), ts(2)), Phaser.Geom.Circle.Contains);
  }

  // ── Ark  (120×100) ────────────────────────────────────────────────────
  _pageArk(tx, ty, ts) {
    this._z((g, c) => {
      g.fillStyle(c); g.fillRect(tx(0), ty(50), ts(120), ts(50));
      g.lineStyle(3, 0x222222); g.strokeRect(tx(0), ty(50), ts(120), ts(50));
    }, new Phaser.Geom.Rectangle(tx(0), ty(50), ts(120), ts(50)), Phaser.Geom.Rectangle.Contains);

    this._z((g, c) => {
      g.fillStyle(c); g.fillRect(tx(20), ty(20), ts(80), ts(35));
      g.lineStyle(3, 0x222222); g.strokeRect(tx(20), ty(20), ts(80), ts(35));
    }, new Phaser.Geom.Rectangle(tx(20), ty(20), ts(80), ts(35)), Phaser.Geom.Rectangle.Contains);

    this._z((g, c) => {
      g.fillStyle(c);
      g.fillTriangle(tx(15), ty(20), tx(105), ty(20), tx(60), ty(2));
      g.lineStyle(3, 0x222222);
      g.strokePoints([{x:tx(15),y:ty(20)},{x:tx(105),y:ty(20)},{x:tx(60),y:ty(2)}], true);
    }, new Phaser.Geom.Triangle(tx(15), ty(20), tx(105), ty(20), tx(60), ty(2)), Phaser.Geom.Triangle.Contains);

    this._z((g, c) => {
      g.fillStyle(c);
      [28, 53, 78].forEach(wx => g.fillRect(tx(wx), ty(28), ts(14), ts(12)));
      g.lineStyle(3, 0x222222);
      [28, 53, 78].forEach(wx => g.strokeRect(tx(wx), ty(28), ts(14), ts(12)));
    }, new Phaser.Geom.Rectangle(tx(28), ty(28), ts(64), ts(12)), Phaser.Geom.Rectangle.Contains);
  }
}
