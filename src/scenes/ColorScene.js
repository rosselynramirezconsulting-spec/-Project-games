export default class ColorScene extends Phaser.Scene {
  constructor() { super('Color'); }

  create() {
    const W = 390, H = 844;
    this._sel   = 0xff3333;
    this._page  = 0;
    this._pages = ['noah', 'elephant', 'lion', 'rabbit', 'ark'];
    this._zones = [];
    this._olGfx = null;

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
          this._page = (this._page + dir + this._pages.length) % this._pages.length;
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
    this.add.text(195, H - 192, 'Tap a part, then pick a color:', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#885500',
    }).setOrigin(0.5).setDepth(10);
    this._swatches = COLS.map((color, i) => {
      const col = i % perRow, row = Math.floor(i / perRow);
      const sw = this.add.rectangle(x0 + col * (sz + gap), y0 + row * (sz + gap), sz - 2, sz - 2, color)
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
    if (this._olGfx) { this._olGfx.destroy(); this._olGfx = null; }
    const LABELS = ['Noah', 'Elephant', 'Lion', 'Rabbit', 'The Ark'];
    this._subTitle.setText(`${LABELS[this._page]}   (${this._page + 1} / ${this._pages.length})`);
    const p = this._pages[this._page];
    this[`_zones_${p}`]();
    this._olGfx = this.add.graphics().setDepth(6);
    this[`_draw_${p}`](this._olGfx);
  }

  // Zone: starts white, tap fills with selected color, then redraws outlines on top
  _z(drawFn, geom, geomContains) {
    const gfx = this.add.graphics().setDepth(4);
    const paint = col => { gfx.clear(); gfx.fillStyle(col, 1); drawFn(gfx); };
    paint(0xffffff);
    gfx.setInteractive(geom, geomContains);
    gfx.on('pointerdown', () => {
      paint(this._sel);
      this._olGfx.clear();
      this[`_draw_${this._pages[this._page]}`](this._olGfx);
    });
    this._zones.push(gfx);
  }

  // ─── NOAH ──────────────────────────────────────────────────────────────────
  _zones_noah() {
    const cx = 195;
    // Staff
    this._z(g => g.fillRect(101, 158, 12, 330),
      new Phaser.Geom.Rectangle(96, 154, 22, 334), Phaser.Geom.Rectangle.Contains);
    // Hat
    this._z(g => { g.fillRect(150, 102, 90, 44); g.fillRect(140, 142, 110, 18); },
      new Phaser.Geom.Rectangle(140, 102, 110, 58), Phaser.Geom.Rectangle.Contains);
    // Head / skin
    this._z(g => g.fillCircle(cx, 200, 40),
      new Phaser.Geom.Circle(cx, 200, 40), Phaser.Geom.Circle.Contains);
    // Beard
    this._z(g => g.fillTriangle(163, 237, 227, 237, cx, 288),
      new Phaser.Geom.Triangle(163, 237, 227, 237, cx, 288), Phaser.Geom.Triangle.Contains);
    // Left arm
    this._z(g => g.fillRect(119, 248, 35, 86),
      new Phaser.Geom.Rectangle(119, 248, 35, 86), Phaser.Geom.Rectangle.Contains);
    // Robe body
    this._z(g => g.fillRect(152, 237, 86, 128),
      new Phaser.Geom.Rectangle(152, 237, 86, 128), Phaser.Geom.Rectangle.Contains);
    // Right arm
    this._z(g => g.fillRect(240, 248, 35, 86),
      new Phaser.Geom.Rectangle(240, 248, 35, 86), Phaser.Geom.Rectangle.Contains);
    // Skirt
    this._z(g => g.fillTriangle(135, 365, 255, 365, cx, 488),
      new Phaser.Geom.Triangle(135, 365, 255, 365, cx, 488), Phaser.Geom.Triangle.Contains);
  }

  _draw_noah(g) {
    const cx = 195, ls = 3.5;
    // Staff (behind body)
    g.lineStyle(4.5, 0x000000, 1);
    g.lineBetween(107, 488, 107, 175);
    g.lineBetween(107, 175, 96, 157);
    g.lineBetween(96, 157, 114, 145);
    // Hat brim
    g.lineStyle(ls, 0x000000, 1);
    g.strokeRect(140, 142, 110, 18);
    // Hat body
    g.strokeRect(150, 102, 90, 44);
    // Head
    g.strokeCircle(cx, 200, 40);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(cx - 14, 193, 5);
    g.fillCircle(cx + 14, 193, 5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 12, 191, 2);
    g.fillCircle(cx + 12, 191, 2);
    // Eyebrows
    g.lineStyle(2.5, 0x000000, 1);
    g.lineBetween(cx - 20, 183, cx - 8, 181);
    g.lineBetween(cx + 8, 181, cx + 20, 183);
    // Nose
    g.lineStyle(2, 0x000000, 1);
    g.lineBetween(cx - 1, 198, cx - 5, 209);
    g.lineBetween(cx + 1, 198, cx + 5, 209);
    g.lineBetween(cx - 5, 209, cx + 5, 209);
    // Smile
    g.lineStyle(2.5, 0x000000, 1);
    g.strokePoints([{ x: cx - 12, y: 216 }, { x: cx, y: 224 }, { x: cx + 12, y: 216 }], false);
    // Beard outline + texture lines
    g.lineStyle(ls, 0x000000, 1);
    g.strokeTriangle(163, 237, 227, 237, cx, 288);
    g.lineStyle(2, 0x000000, 0.55);
    g.lineBetween(cx - 5, 237, cx - 10, 286);
    g.lineBetween(cx, 237, cx, 287);
    g.lineBetween(cx + 5, 237, cx + 10, 286);
    // Neck
    g.lineStyle(ls, 0x000000, 1);
    g.lineBetween(cx - 12, 238, cx - 12, 240);
    g.lineBetween(cx + 12, 238, cx + 12, 240);
    // Arms
    g.strokeRect(119, 248, 35, 86);
    g.strokeRect(240, 248, 35, 86);
    // Robe body
    g.strokeRect(152, 237, 86, 128);
    // Robe fold lines
    g.lineStyle(2, 0x000000, 0.38);
    g.lineBetween(cx, 237, cx, 365);
    g.lineBetween(152, 280, 238, 280);
    g.lineBetween(152, 323, 238, 323);
    // Skirt
    g.lineStyle(ls, 0x000000, 1);
    g.strokeTriangle(135, 365, 255, 365, cx, 488);
    g.lineStyle(2, 0x000000, 0.38);
    g.lineBetween(cx - 22, 365, cx - 11, 488);
    g.lineBetween(cx + 22, 365, cx + 11, 488);
    // Sandals
    g.lineStyle(2.5, 0x000000, 1);
    g.strokeEllipse(cx - 24, 491, 34, 12);
    g.strokeEllipse(cx + 24, 491, 34, 12);
  }

  // ─── ELEPHANT ─────────────────────────────────────────────────────────────
  _zones_elephant() {
    const cx = 195;
    // Left outer ear
    this._z(g => g.fillEllipse(112, 228, 108, 148),
      new Phaser.Geom.Ellipse(112, 228, 108, 148), Phaser.Geom.Ellipse.Contains);
    // Right outer ear
    this._z(g => g.fillEllipse(278, 228, 108, 148),
      new Phaser.Geom.Ellipse(278, 228, 108, 148), Phaser.Geom.Ellipse.Contains);
    // Left inner ear (pink)
    this._z(g => g.fillEllipse(116, 232, 64, 94),
      new Phaser.Geom.Ellipse(116, 232, 64, 94), Phaser.Geom.Ellipse.Contains);
    // Right inner ear (pink)
    this._z(g => g.fillEllipse(274, 232, 64, 94),
      new Phaser.Geom.Ellipse(274, 232, 64, 94), Phaser.Geom.Ellipse.Contains);
    // Head
    this._z(g => g.fillCircle(cx, 228, 72),
      new Phaser.Geom.Circle(cx, 228, 72), Phaser.Geom.Circle.Contains);
    // Trunk
    this._z(g => {
      g.fillRect(178, 296, 34, 126);
      g.fillEllipse(195, 422, 50, 26);
    }, new Phaser.Geom.Rectangle(170, 296, 50, 152), Phaser.Geom.Rectangle.Contains);
    // Body
    this._z(g => g.fillEllipse(cx, 392, 204, 148),
      new Phaser.Geom.Ellipse(cx, 392, 204, 148), Phaser.Geom.Ellipse.Contains);
    // Legs
    this._z(g => {
      g.fillRect(112, 452, 40, 70);
      g.fillRect(160, 458, 40, 70);
      g.fillRect(200, 458, 40, 70);
      g.fillRect(248, 452, 40, 70);
    }, new Phaser.Geom.Rectangle(112, 452, 176, 70), Phaser.Geom.Rectangle.Contains);
  }

  _draw_elephant(g) {
    const cx = 195, ls = 3.5;
    // Left ear
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(112, 228, 108, 148);
    g.lineStyle(2, 0x000000, 0.55);
    g.strokeEllipse(116, 232, 64, 94);
    // Right ear
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(278, 228, 108, 148);
    g.lineStyle(2, 0x000000, 0.55);
    g.strokeEllipse(274, 232, 64, 94);
    // Head
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(cx, 228, 72);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(cx - 24, 210, 8);
    g.fillCircle(cx + 24, 210, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 21, 207, 3);
    g.fillCircle(cx + 21, 207, 3);
    // Trunk
    g.lineStyle(ls, 0x000000, 1);
    g.lineBetween(178, 298, 178, 420);
    g.lineBetween(212, 298, 212, 420);
    g.strokeEllipse(195, 422, 50, 26);
    // Trunk wrinkle lines
    g.lineStyle(2, 0x000000, 0.4);
    for (let ty = 320; ty < 418; ty += 22) g.lineBetween(178, ty, 212, ty + 5);
    // Tusks (small ovals)
    g.lineStyle(2.5, 0x000000, 1);
    g.strokeEllipse(cx - 28, 310, 18, 38);
    g.strokeEllipse(cx + 28, 310, 18, 38);
    // Body
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx, 392, 204, 148);
    // Tail
    g.lineStyle(3, 0x000000, 1);
    g.strokePoints([{ x: 294, y: 345 }, { x: 310, y: 372 }, { x: 298, y: 400 }, { x: 312, y: 416 }], false);
    // Legs
    g.lineStyle(ls, 0x000000, 1);
    g.strokeRect(112, 452, 40, 70);
    g.strokeRect(160, 458, 40, 70);
    g.strokeRect(200, 458, 40, 70);
    g.strokeRect(248, 452, 40, 70);
    // Toenail lines
    g.lineStyle(2, 0x000000, 0.5);
    [112, 160, 200, 248].forEach(lx => {
      g.lineBetween(lx + 8, 521, lx + 16, 521);
      g.lineBetween(lx + 22, 521, lx + 32, 521);
    });
  }

  // ─── LION ──────────────────────────────────────────────────────────────────
  _zones_lion() {
    const cx = 195, cy = 248;
    // Mane (outer ring)
    this._z(g => g.fillCircle(cx, cy, 118),
      new Phaser.Geom.Circle(cx, cy, 118), Phaser.Geom.Circle.Contains);
    // Face
    this._z(g => g.fillCircle(cx, cy, 80),
      new Phaser.Geom.Circle(cx, cy, 80), Phaser.Geom.Circle.Contains);
    // Muzzle
    this._z(g => g.fillEllipse(cx, cy + 32, 70, 48),
      new Phaser.Geom.Ellipse(cx, cy + 32, 70, 48), Phaser.Geom.Ellipse.Contains);
    // Body
    this._z(g => g.fillEllipse(cx, cy + 222, 168, 118),
      new Phaser.Geom.Ellipse(cx, cy + 222, 168, 118), Phaser.Geom.Ellipse.Contains);
    // Front legs
    this._z(g => {
      g.fillRect(cx - 82, cy + 268, 46, 98);
      g.fillRect(cx + 36, cy + 268, 46, 98);
    }, new Phaser.Geom.Rectangle(cx - 82, cy + 268, 164, 98), Phaser.Geom.Rectangle.Contains);
    // Tail tuft
    this._z(g => g.fillCircle(cx + 108, cy + 218, 28),
      new Phaser.Geom.Circle(cx + 108, cy + 218, 28), Phaser.Geom.Circle.Contains);
  }

  _draw_lion(g) {
    const cx = 195, cy = 248, ls = 3.5;
    // Mane
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(cx, cy, 118);
    // Mane texture spokes
    g.lineStyle(2, 0x000000, 0.4);
    for (let a = 0; a < 360; a += 24) {
      const r = a * Math.PI / 180;
      g.lineBetween(cx + Math.cos(r) * 82, cy + Math.sin(r) * 82,
        cx + Math.cos(r) * 115, cy + Math.sin(r) * 115);
    }
    // Ears (triangles peeking above mane)
    g.lineStyle(ls, 0x000000, 1);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(cx - 72, cy - 80, cx - 48, cy - 80, cx - 60, cy - 108);
    g.fillTriangle(cx + 48, cy - 80, cx + 72, cy - 80, cx + 60, cy - 108);
    g.strokeTriangle(cx - 72, cy - 80, cx - 48, cy - 80, cx - 60, cy - 108);
    g.strokeTriangle(cx + 48, cy - 80, cx + 72, cy - 80, cx + 60, cy - 108);
    // Face
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(cx, cy, 80);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(cx - 28, cy - 18, 10);
    g.fillCircle(cx + 28, cy - 18, 10);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 24, cy - 21, 4);
    g.fillCircle(cx + 24, cy - 21, 4);
    // Muzzle
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx, cy + 32, 70, 48);
    // Nose
    g.fillStyle(0x000000, 1);
    g.fillTriangle(cx - 10, cy + 14, cx + 10, cy + 14, cx, cy + 26);
    // Mouth
    g.lineStyle(2.5, 0x000000, 1);
    g.lineBetween(cx, cy + 26, cx, cy + 36);
    g.lineBetween(cx, cy + 36, cx - 16, cy + 44);
    g.lineBetween(cx, cy + 36, cx + 16, cy + 44);
    // Whiskers
    g.lineStyle(2, 0x000000, 0.8);
    g.lineBetween(cx - 80, cy + 22, cx - 32, cy + 28);
    g.lineBetween(cx - 80, cy + 32, cx - 32, cy + 34);
    g.lineBetween(cx - 78, cy + 42, cx - 32, cy + 40);
    g.lineBetween(cx + 80, cy + 22, cx + 32, cy + 28);
    g.lineBetween(cx + 80, cy + 32, cx + 32, cy + 34);
    g.lineBetween(cx + 78, cy + 42, cx + 32, cy + 40);
    // Body
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx, cy + 222, 168, 118);
    // Front legs
    g.strokeRect(cx - 82, cy + 268, 46, 98);
    g.strokeRect(cx + 36, cy + 268, 46, 98);
    // Paws
    g.lineStyle(2.5, 0x000000, 1);
    g.strokeEllipse(cx - 59, cy + 370, 50, 18);
    g.strokeEllipse(cx + 59, cy + 370, 50, 18);
    // Claw lines
    g.lineStyle(2, 0x000000, 0.5);
    [-72, -60, -46].forEach(ox => g.lineBetween(cx + ox, cy + 369, cx + ox, cy + 380));
    [46, 58, 72].forEach(ox => g.lineBetween(cx + ox, cy + 369, cx + ox, cy + 380));
    // Tail line + tuft
    g.lineStyle(ls, 0x000000, 1);
    g.strokePoints([{ x: cx + 82, y: cy + 178 }, { x: cx + 106, y: cy + 196 },
      { x: cx + 116, y: cy + 222 }], false);
    g.strokeCircle(cx + 108, cy + 218, 28);
    g.lineStyle(2, 0x000000, 0.4);
    for (let a = 0; a < 360; a += 30) {
      const r = a * Math.PI / 180;
      g.lineBetween(cx + 108 + Math.cos(r) * 22, cy + 218 + Math.sin(r) * 22,
        cx + 108 + Math.cos(r) * 30, cy + 218 + Math.sin(r) * 30);
    }
  }

  // ─── RABBIT ────────────────────────────────────────────────────────────────
  _zones_rabbit() {
    const cx = 195, cy = 310;
    // Left outer ear
    this._z(g => g.fillEllipse(cx - 42, cy - 140, 54, 148),
      new Phaser.Geom.Ellipse(cx - 42, cy - 140, 54, 148), Phaser.Geom.Ellipse.Contains);
    // Right outer ear
    this._z(g => g.fillEllipse(cx + 42, cy - 140, 54, 148),
      new Phaser.Geom.Ellipse(cx + 42, cy - 140, 54, 148), Phaser.Geom.Ellipse.Contains);
    // Left inner ear (pink)
    this._z(g => g.fillEllipse(cx - 42, cy - 140, 28, 96),
      new Phaser.Geom.Ellipse(cx - 42, cy - 140, 28, 96), Phaser.Geom.Ellipse.Contains);
    // Right inner ear (pink)
    this._z(g => g.fillEllipse(cx + 42, cy - 140, 28, 96),
      new Phaser.Geom.Ellipse(cx + 42, cy - 140, 28, 96), Phaser.Geom.Ellipse.Contains);
    // Head
    this._z(g => g.fillCircle(cx, cy - 52, 70),
      new Phaser.Geom.Circle(cx, cy - 52, 70), Phaser.Geom.Circle.Contains);
    // Muzzle
    this._z(g => g.fillEllipse(cx, cy - 22, 62, 44),
      new Phaser.Geom.Ellipse(cx, cy - 22, 62, 44), Phaser.Geom.Ellipse.Contains);
    // Body
    this._z(g => g.fillEllipse(cx, cy + 102, 172, 200),
      new Phaser.Geom.Ellipse(cx, cy + 102, 172, 200), Phaser.Geom.Ellipse.Contains);
    // Tail
    this._z(g => g.fillCircle(cx + 98, cy + 82, 32),
      new Phaser.Geom.Circle(cx + 98, cy + 82, 32), Phaser.Geom.Circle.Contains);
    // Front paws
    this._z(g => {
      g.fillEllipse(cx - 42, cy + 205, 64, 30);
      g.fillEllipse(cx + 42, cy + 205, 64, 30);
    }, new Phaser.Geom.Rectangle(cx - 74, cy + 192, 148, 42), Phaser.Geom.Rectangle.Contains);
  }

  _draw_rabbit(g) {
    const cx = 195, cy = 310, ls = 3.5;
    // Outer ears
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx - 42, cy - 140, 54, 148);
    g.strokeEllipse(cx + 42, cy - 140, 54, 148);
    // Inner ears
    g.lineStyle(2, 0x000000, 0.55);
    g.strokeEllipse(cx - 42, cy - 140, 28, 96);
    g.strokeEllipse(cx + 42, cy - 140, 28, 96);
    // Head
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(cx, cy - 52, 70);
    // Eyes (big cute)
    g.fillStyle(0x000000, 1);
    g.fillCircle(cx - 26, cy - 66, 11);
    g.fillCircle(cx + 26, cy - 66, 11);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 22, cy - 70, 4);
    g.fillCircle(cx + 22, cy - 70, 4);
    // Nose
    g.fillStyle(0x000000, 1);
    g.fillEllipse(cx, cy - 32, 14, 10);
    // Muzzle
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx, cy - 22, 62, 44);
    // Mouth
    g.lineStyle(2.5, 0x000000, 1);
    g.lineBetween(cx, cy - 27, cx, cy - 16);
    g.lineBetween(cx, cy - 16, cx - 16, cy - 8);
    g.lineBetween(cx, cy - 16, cx + 16, cy - 8);
    // Whiskers
    g.lineStyle(2, 0x000000, 0.8);
    g.lineBetween(cx - 82, cy - 22, cx - 28, cy - 20);
    g.lineBetween(cx - 82, cy - 14, cx - 28, cy - 16);
    g.lineBetween(cx + 28, cy - 20, cx + 82, cy - 22);
    g.lineBetween(cx + 28, cy - 16, cx + 82, cy - 14);
    // Body
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx, cy + 102, 172, 200);
    // Belly tuft
    g.lineStyle(2, 0x000000, 0.45);
    g.strokeEllipse(cx, cy + 95, 88, 120);
    // Tail
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(cx + 98, cy + 82, 32);
    g.lineStyle(2, 0x000000, 0.4);
    for (let a = 0; a < 360; a += 30) {
      const r = a * Math.PI / 180;
      g.lineBetween(cx + 98 + Math.cos(r) * 25, cy + 82 + Math.sin(r) * 25,
        cx + 98 + Math.cos(r) * 34, cy + 82 + Math.sin(r) * 34);
    }
    // Paws
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx - 42, cy + 205, 64, 30);
    g.strokeEllipse(cx + 42, cy + 205, 64, 30);
    // Toe lines
    g.lineStyle(2, 0x000000, 0.5);
    [cx - 56, cx - 44, cx - 30].forEach(px => {
      g.lineBetween(px, cy + 203, px, cy + 218);
    });
    [cx + 30, cx + 44, cx + 56].forEach(px => {
      g.lineBetween(px, cy + 203, px, cy + 218);
    });
  }

  // ─── ARK ───────────────────────────────────────────────────────────────────
  _zones_ark() {
    const cx = 195;
    // Hull
    this._z(g => g.fillRect(34, 382, 322, 116),
      new Phaser.Geom.Rectangle(34, 382, 322, 116), Phaser.Geom.Rectangle.Contains);
    // Main cabin
    this._z(g => g.fillRect(56, 278, 278, 108),
      new Phaser.Geom.Rectangle(56, 278, 278, 108), Phaser.Geom.Rectangle.Contains);
    // Upper cabin
    this._z(g => g.fillRect(108, 198, 174, 84),
      new Phaser.Geom.Rectangle(108, 198, 174, 84), Phaser.Geom.Rectangle.Contains);
    // Roof
    this._z(g => g.fillTriangle(46, 278, 344, 278, cx, 148),
      new Phaser.Geom.Triangle(46, 278, 344, 278, cx, 148), Phaser.Geom.Triangle.Contains);
    // Windows (3 in main cabin)
    this._z(g => {
      g.fillRect(80, 298, 44, 36);
      g.fillRect(173, 298, 44, 36);
      g.fillRect(266, 298, 44, 36);
    }, new Phaser.Geom.Rectangle(80, 298, 230, 36), Phaser.Geom.Rectangle.Contains);
    // Door
    this._z(g => g.fillRect(167, 212, 56, 68),
      new Phaser.Geom.Rectangle(167, 212, 56, 68), Phaser.Geom.Rectangle.Contains);
    // Water
    this._z(g => g.fillRect(20, 498, 350, 36),
      new Phaser.Geom.Rectangle(20, 498, 350, 36), Phaser.Geom.Rectangle.Contains);
  }

  _draw_ark(g) {
    const cx = 195, ls = 3.5;
    // Water
    g.lineStyle(ls, 0x000000, 1);
    g.strokeRect(20, 498, 350, 36);
    g.lineStyle(2, 0x000000, 0.5);
    for (let wx = 30; wx < 365; wx += 42) {
      g.strokePoints([
        { x: wx, y: 510 }, { x: wx + 10, y: 503 }, { x: wx + 21, y: 510 },
        { x: wx + 31, y: 503 }, { x: wx + 42, y: 510 },
      ], false);
    }
    // Hull
    g.lineStyle(ls, 0x000000, 1);
    g.strokeRect(34, 382, 322, 116);
    g.lineStyle(2, 0x000000, 0.4);
    for (let hx = 66; hx < 358; hx += 40) g.lineBetween(hx, 382, hx, 498);
    g.lineBetween(34, 422, 356, 422);
    g.lineBetween(34, 460, 356, 460);
    // Main cabin
    g.lineStyle(ls, 0x000000, 1);
    g.strokeRect(56, 278, 278, 108);
    g.lineStyle(2, 0x000000, 0.3);
    g.lineBetween(56, 314, 334, 314);
    g.lineBetween(56, 350, 334, 350);
    // Cabin windows
    g.lineStyle(ls, 0x000000, 1);
    [80, 173, 266].forEach(wx => {
      g.strokeRect(wx, 298, 44, 36);
      g.lineStyle(2, 0x000000, 0.65);
      g.lineBetween(wx + 22, 298, wx + 22, 334);
      g.lineBetween(wx, 316, wx + 44, 316);
      g.lineStyle(ls, 0x000000, 1);
    });
    // Upper cabin
    g.strokeRect(108, 198, 174, 84);
    // Door
    g.strokeRect(167, 212, 56, 68);
    g.lineStyle(2.5, 0x000000, 0.7);
    g.strokePoints([
      { x: 167, y: 228 }, { x: 177, y: 214 }, { x: cx, y: 210 },
      { x: 213, y: 214 }, { x: 223, y: 228 },
    ], false);
    // Roof
    g.lineStyle(ls, 0x000000, 1);
    g.strokeTriangle(46, 278, 344, 278, cx, 148);
    g.lineStyle(2, 0x000000, 0.38);
    for (let i = 1; i <= 4; i++) {
      const ty = 148 + (278 - 148) * i / 5;
      const hw = (344 - 46) / 2 * i / 5;
      g.lineBetween(cx - hw, ty, cx + hw, ty);
    }
    // Flag pole + flag
    g.lineStyle(3, 0x000000, 1);
    g.lineBetween(cx, 148, cx, 108);
    g.strokeTriangle(cx, 108, cx + 32, 120, cx, 134);
    // Small animal in left window (peeking bunny)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(102, 310, 13);
    g.lineStyle(2, 0x000000, 1);
    g.strokeCircle(102, 310, 13);
    g.fillStyle(0x000000, 1);
    g.fillCircle(97, 307, 3);
    g.fillCircle(107, 307, 3);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(95, 299, 10, 18);
    g.fillEllipse(109, 299, 10, 18);
    g.lineStyle(2, 0x000000, 1);
    g.strokeEllipse(95, 299, 10, 18);
    g.strokeEllipse(109, 299, 10, 18);
    // Animal in right window (peeking elephant head)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(288, 310, 13);
    g.lineStyle(2, 0x000000, 1);
    g.strokeCircle(288, 310, 13);
    g.fillStyle(0x000000, 1);
    g.fillCircle(283, 307, 3);
    g.fillCircle(293, 307, 3);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(277, 308, 9, 14);
    g.fillEllipse(299, 308, 9, 14);
    g.lineStyle(2, 0x000000, 1);
    g.strokeEllipse(277, 308, 9, 14);
    g.strokeEllipse(299, 308, 9, 14);
    g.lineStyle(2, 0x000000, 0.7);
    g.lineBetween(286, 322, 284, 336);
    g.lineBetween(290, 322, 292, 336);
  }
}
