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
    this.add.text(W / 2, 16, 'Colorear', {
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

    // Parchment coloring area
    this.add.rectangle(W / 2, 308, 360, 462, 0xfff8e7).setDepth(1);
    const brdr = this.add.graphics().setDepth(2);
    brdr.lineStyle(4, 0xddbb66, 1);
    brdr.strokeRect(15, 77, 360, 462);

    // Color palette
    this._buildPalette(W, H);

    // Limpiar button
    const clrBtn = this.add.rectangle(90, H - 32, 140, 44, 0x226622)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(90, H - 32, 'Limpiar', {
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
    this.add.text(W / 2, H - 192, 'Elige un color:', {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#885500',
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
    const LABELS = ['Noah', 'Elefante', 'Leon', 'Conejo', 'El Arca'];
    this._subTitle.setText(`${LABELS[this._page]}   (${this._page + 1} / ${this._pages.length})`);
    ({ noah: () => this._pageNoah(),
       elephant: () => this._pageElephant(),
       lion: () => this._pageLion(),
       rabbit: () => this._pageRabbit(),
       ark: () => this._pageArk(),
    })[this._pages[this._page]]?.();
  }

  _z(drawFn, geom, geomContains, defColor) {
    const gfx = this.add.graphics().setDepth(5);
    let color = defColor;
    const redraw = () => { gfx.clear(); drawFn(gfx, color); };
    redraw();
    gfx.setInteractive(geom, geomContains);
    gfx.on('pointerdown', () => { color = this._sel; redraw(); });
    this._zones.push(gfx);
    return gfx;
  }

  // ── Noah ──────────────────────────────────────────────────────────────
  _pageNoah() {
    const S = 4, cx = 195, oy = 165;
    const ox = cx - 24 * S;

    // Robe
    this._z((g, c) => {
      g.fillStyle(c); g.fillRect(ox+10*S, oy+30*S, 28*S, 28*S);
      g.lineStyle(3, 0x222222); g.strokeRect(ox+10*S, oy+30*S, 28*S, 28*S);
    }, new Phaser.Geom.Rectangle(ox+10*S, oy+30*S, 28*S, 28*S), Phaser.Geom.Rectangle.Contains, 0xeeddcc);

    // Head / face
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(cx, oy+18*S, 13*S);
      g.lineStyle(3, 0x222222); g.strokeCircle(cx, oy+18*S, 13*S);
    }, new Phaser.Geom.Circle(cx, oy+18*S, 13*S), Phaser.Geom.Circle.Contains, 0xf5cba7);

    // Beard
    this._z((g, c) => {
      g.fillStyle(c);
      g.fillTriangle(ox+16*S, oy+26*S, ox+32*S, oy+26*S, cx, oy+38*S);
      g.lineStyle(3, 0x222222);
      g.strokePoints([{x:ox+16*S,y:oy+26*S},{x:ox+32*S,y:oy+26*S},{x:cx,y:oy+38*S}], true);
    }, new Phaser.Geom.Triangle(ox+16*S, oy+26*S, ox+32*S, oy+26*S, cx, oy+38*S), Phaser.Geom.Triangle.Contains, 0xffffff);

    // Hat
    this._z((g, c) => {
      g.fillStyle(c); g.fillRect(ox+10*S, oy+4*S, 28*S, 14*S);
      g.lineStyle(3, 0x222222); g.strokeRect(ox+10*S, oy+4*S, 28*S, 14*S);
    }, new Phaser.Geom.Rectangle(ox+10*S, oy+4*S, 28*S, 14*S), Phaser.Geom.Rectangle.Contains, 0x6b4226);
  }

  // ── Elephant ──────────────────────────────────────────────────────────
  _pageElephant() {
    const S = 5, cx = 195, cy = 310;
    const ox = cx - 20*S, oy = cy - 22*S;

    // Body + head
    this._z((g, c) => {
      g.fillStyle(c);
      g.fillCircle(ox+20*S, oy+20*S, 14*S);
      g.fillCircle(ox+20*S, oy+8*S,  9*S);
      g.lineStyle(3, 0x222222);
      g.strokeCircle(ox+20*S, oy+20*S, 14*S);
      g.strokeCircle(ox+20*S, oy+8*S,  9*S);
    }, new Phaser.Geom.Circle(ox+20*S, oy+16*S, 20*S), Phaser.Geom.Circle.Contains, 0x888888);

    // Trunk
    this._z((g, c) => {
      g.fillStyle(c); g.fillRect(ox+12*S, oy+14*S, 5*S, 16*S);
      g.lineStyle(3, 0x222222); g.strokeRect(ox+12*S, oy+14*S, 5*S, 16*S);
    }, new Phaser.Geom.Rectangle(ox+12*S, oy+14*S, 5*S, 16*S), Phaser.Geom.Rectangle.Contains, 0x999999);

    // Ear
    this._z((g, c) => {
      g.fillStyle(c); g.fillEllipse(ox+9*S, oy+6*S, 9*S, 12*S);
      g.lineStyle(3, 0x222222); g.strokeEllipse(ox+9*S, oy+6*S, 9*S, 12*S);
    }, new Phaser.Geom.Ellipse(ox+9*S, oy+6*S, 9*S, 12*S), Phaser.Geom.Ellipse.Contains, 0xf5a0a0);

    // Legs
    this._z((g, c) => {
      g.fillStyle(c);
      g.fillRect(ox+8*S, oy+31*S, 7*S, 11*S);
      g.fillRect(ox+25*S, oy+31*S, 7*S, 11*S);
      g.lineStyle(3, 0x222222);
      g.strokeRect(ox+8*S, oy+31*S, 7*S, 11*S);
      g.strokeRect(ox+25*S, oy+31*S, 7*S, 11*S);
    }, new Phaser.Geom.Rectangle(ox+8*S, oy+31*S, 24*S, 11*S), Phaser.Geom.Rectangle.Contains, 0x888888);
  }

  // ── Lion ──────────────────────────────────────────────────────────────
  _pageLion() {
    const S = 5, cx = 195, cy = 310;
    const ox = cx - 20*S, oy = cy - 22*S;

    // Mane
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(ox+20*S, oy+20*S, 18*S);
      g.lineStyle(3, 0x222222); g.strokeCircle(ox+20*S, oy+20*S, 18*S);
    }, new Phaser.Geom.Circle(ox+20*S, oy+20*S, 18*S), Phaser.Geom.Circle.Contains, 0xc8860a);

    // Face
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(ox+20*S, oy+20*S, 13*S);
      g.lineStyle(3, 0x222222); g.strokeCircle(ox+20*S, oy+20*S, 13*S);
    }, new Phaser.Geom.Circle(ox+20*S, oy+20*S, 13*S), Phaser.Geom.Circle.Contains, 0xd4a017);

    // Nose
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(ox+20*S, oy+23*S, 5*S);
      g.lineStyle(3, 0x222222); g.strokeCircle(ox+20*S, oy+23*S, 5*S);
    }, new Phaser.Geom.Circle(ox+20*S, oy+23*S, 5*S), Phaser.Geom.Circle.Contains, 0xff9999);
  }

  // ── Rabbit ────────────────────────────────────────────────────────────
  _pageRabbit() {
    const S = 5, cx = 195, oy = 178;
    const ox = cx - 20*S;

    // Outer ears
    this._z((g, c) => {
      g.fillStyle(c);
      g.fillRect(ox+14*S, oy,     6*S, 14*S);
      g.fillRect(ox+22*S, oy,     6*S, 14*S);
      g.lineStyle(3, 0x222222);
      g.strokeRect(ox+14*S, oy,   6*S, 14*S);
      g.strokeRect(ox+22*S, oy,   6*S, 14*S);
    }, new Phaser.Geom.Rectangle(ox+14*S, oy, 14*S, 14*S), Phaser.Geom.Rectangle.Contains, 0xffffff);

    // Inner ears
    this._z((g, c) => {
      g.fillStyle(c);
      g.fillRect(ox+15*S, oy+1*S, 4*S, 11*S);
      g.fillRect(ox+23*S, oy+1*S, 4*S, 11*S);
      g.lineStyle(3, 0x222222);
      g.strokeRect(ox+15*S, oy+1*S, 4*S, 11*S);
      g.strokeRect(ox+23*S, oy+1*S, 4*S, 11*S);
    }, new Phaser.Geom.Rectangle(ox+15*S, oy+1*S, 12*S, 11*S), Phaser.Geom.Rectangle.Contains, 0xffaaaa);

    // Head
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(cx, oy+13*S, 9*S);
      g.lineStyle(3, 0x222222); g.strokeCircle(cx, oy+13*S, 9*S);
    }, new Phaser.Geom.Circle(cx, oy+13*S, 9*S), Phaser.Geom.Circle.Contains, 0xffffff);

    // Body
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(cx, oy+25*S, 13*S);
      g.lineStyle(3, 0x222222); g.strokeCircle(cx, oy+25*S, 13*S);
    }, new Phaser.Geom.Circle(cx, oy+25*S, 13*S), Phaser.Geom.Circle.Contains, 0xffffff);

    // Nose
    this._z((g, c) => {
      g.fillStyle(c); g.fillCircle(cx, oy+18*S, 3*S);
      g.lineStyle(3, 0x222222); g.strokeCircle(cx, oy+18*S, 3*S);
    }, new Phaser.Geom.Circle(cx, oy+18*S, 3*S), Phaser.Geom.Circle.Contains, 0xff9999);
  }

  // ── Ark ───────────────────────────────────────────────────────────────
  _pageArk() {
    const S = 2.6, cx = 195, cy = 300;
    const ox = cx - 60*S, oy = cy - 50*S;

    // Hull
    this._z((g, c) => {
      g.fillStyle(c); g.fillRect(ox, oy+50*S, 120*S, 50*S);
      g.lineStyle(3, 0x222222); g.strokeRect(ox, oy+50*S, 120*S, 50*S);
    }, new Phaser.Geom.Rectangle(ox, oy+50*S, 120*S, 50*S), Phaser.Geom.Rectangle.Contains, 0x8B4513);

    // Cabin
    this._z((g, c) => {
      g.fillStyle(c); g.fillRect(ox+20*S, oy+20*S, 80*S, 35*S);
      g.lineStyle(3, 0x222222); g.strokeRect(ox+20*S, oy+20*S, 80*S, 35*S);
    }, new Phaser.Geom.Rectangle(ox+20*S, oy+20*S, 80*S, 35*S), Phaser.Geom.Rectangle.Contains, 0xcd853f);

    // Roof
    this._z((g, c) => {
      g.fillStyle(c);
      g.fillTriangle(ox+15*S, oy+20*S, ox+105*S, oy+20*S, ox+60*S, oy+2*S);
      g.lineStyle(3, 0x222222);
      g.strokePoints([{x:ox+15*S,y:oy+20*S},{x:ox+105*S,y:oy+20*S},{x:ox+60*S,y:oy+2*S}], true);
    }, new Phaser.Geom.Triangle(ox+15*S, oy+20*S, ox+105*S, oy+20*S, ox+60*S, oy+2*S), Phaser.Geom.Triangle.Contains, 0x8B0000);

    // Windows
    this._z((g, c) => {
      g.fillStyle(c);
      [28, 53, 78].forEach(wx => g.fillRect(ox+wx*S, oy+28*S, 14*S, 12*S));
      g.lineStyle(3, 0x222222);
      [28, 53, 78].forEach(wx => g.strokeRect(ox+wx*S, oy+28*S, 14*S, 12*S));
    }, new Phaser.Geom.Rectangle(ox+28*S, oy+28*S, 64*S, 12*S), Phaser.Geom.Rectangle.Contains, 0x87CEEB);
  }
}
