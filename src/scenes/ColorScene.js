import SoundManager from '../utils/SoundManager.js';

export default class ColorScene extends Phaser.Scene {
  constructor() { super('Color'); }

  create() {
    const W = 390, H = 844;
    this._snd   = new SoundManager();
    this._sel   = 0xff3333;
    this._page  = 0;
    this._pages = ['noah', 'elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear', 'ark'];
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
    if (this._olGfx) { this._olGfx.destroy(); this._olGfx = null; }
    const LABELS = ['Noah', 'Elephant', 'Giraffe', 'Lion', 'Zebra', 'Monkey', 'Rabbit', 'Penguin', 'Bear', 'The Ark'];
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
      this._snd.tap();
    });
    this._zones.push(gfx);
  }

  // ─── NOAH ──────────────────────────────────────────────────────────────────
  _zones_noah() {
    const cx = 195;
    // Staff
    this._z(g => g.fillRect(101, 158, 12, 330),
      new Phaser.Geom.Rectangle(96, 154, 22, 334), Phaser.Geom.Rectangle.Contains);
    // Hood/hat — taller rounded shape, more biblical
    this._z(g => {
      g.fillRect(158, 108, 74, 56);
      g.fillCircle(cx, 108, 37);
      g.fillRect(143, 160, 104, 14);
    }, new Phaser.Geom.Rectangle(143, 85, 104, 89), Phaser.Geom.Rectangle.Contains);
    // Head / skin
    this._z(g => g.fillCircle(cx, 204, 40),
      new Phaser.Geom.Circle(cx, 204, 40), Phaser.Geom.Circle.Contains);
    // Left arm (angled inward)
    this._z(g => g.fillTriangle(122, 248, 154, 248, 130, 328),
      new Phaser.Geom.Triangle(122, 248, 154, 248, 130, 328), Phaser.Geom.Triangle.Contains);
    // Robe body
    this._z(g => g.fillRect(152, 240, 86, 128),
      new Phaser.Geom.Rectangle(152, 240, 86, 128), Phaser.Geom.Rectangle.Contains);
    // Right arm (angled inward, holds staff)
    this._z(g => g.fillTriangle(238, 248, 270, 248, 262, 328),
      new Phaser.Geom.Triangle(238, 248, 270, 248, 262, 328), Phaser.Geom.Triangle.Contains);
    // Skirt
    this._z(g => g.fillTriangle(135, 368, 255, 368, cx, 488),
      new Phaser.Geom.Triangle(135, 368, 255, 368, cx, 488), Phaser.Geom.Triangle.Contains);
    // Beard — created after the robe so it wins input over it (it sits on top)
    this._z(g => g.fillTriangle(158, 240, 232, 240, cx, 298),
      new Phaser.Geom.Triangle(158, 240, 232, 240, cx, 298), Phaser.Geom.Triangle.Contains);
  }

  _draw_noah(g) {
    const cx = 195, ls = 3.5;
    // Staff (behind body)
    g.lineStyle(4.5, 0x000000, 1);
    g.lineBetween(107, 488, 107, 175);
    g.lineBetween(107, 175, 96, 157);
    g.lineBetween(96, 157, 114, 145);
    // Hood — rounded top (more biblical than flat top hat)
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(cx, 108, 37);           // rounded crown
    g.strokeRect(158, 108, 74, 56);        // hood sides
    g.lineBetween(143, 160, 252, 160);     // brim line
    g.strokeRect(143, 160, 104, 14);       // brim band
    // Head
    g.strokeCircle(cx, 204, 40);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(cx - 14, 197, 5);
    g.fillCircle(cx + 14, 197, 5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 12, 195, 2);
    g.fillCircle(cx + 12, 195, 2);
    // Eyebrows (bushy, elderly)
    g.lineStyle(3, 0x000000, 1);
    g.lineBetween(cx - 22, 186, cx - 7, 183);
    g.lineBetween(cx + 7, 183, cx + 22, 186);
    // Nose
    g.lineStyle(2, 0x000000, 1);
    g.lineBetween(cx, 200, cx - 5, 212);
    g.lineBetween(cx, 200, cx + 5, 212);
    g.lineBetween(cx - 5, 212, cx + 5, 212);
    // Smile / kind expression
    g.lineStyle(2.5, 0x000000, 1);
    g.strokePoints([{ x: cx - 11, y: 220 }, { x: cx, y: 228 }, { x: cx + 11, y: 220 }], false);
    // Beard — wide with texture lines
    g.lineStyle(ls, 0x000000, 1);
    g.strokeTriangle(158, 240, 232, 240, cx, 298);
    g.lineStyle(2, 0x000000, 0.5);
    g.lineBetween(cx - 8, 240, cx - 14, 296);
    g.lineBetween(cx, 240, cx, 297);
    g.lineBetween(cx + 8, 240, cx + 14, 296);
    // Left arm (angled)
    g.lineStyle(ls, 0x000000, 1);
    g.strokeTriangle(122, 248, 154, 248, 130, 328);
    // Robe body
    g.strokeRect(152, 240, 86, 128);
    // Robe fold lines
    g.lineStyle(2, 0x000000, 0.38);
    g.lineBetween(cx, 240, cx, 368);
    g.lineBetween(152, 284, 238, 284);
    g.lineBetween(152, 328, 238, 328);
    // Right arm (angled)
    g.lineStyle(ls, 0x000000, 1);
    g.strokeTriangle(238, 248, 270, 248, 262, 328);
    // Skirt
    g.strokeTriangle(135, 368, 255, 368, cx, 488);
    g.lineStyle(2, 0x000000, 0.38);
    g.lineBetween(cx - 22, 368, cx - 11, 488);
    g.lineBetween(cx + 22, 368, cx + 11, 488);
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
    // Body
    this._z(g => g.fillEllipse(cx, 392, 204, 148),
      new Phaser.Geom.Ellipse(cx, 392, 204, 148), Phaser.Geom.Ellipse.Contains);
    // Trunk — after the body so it wins input where they overlap (trunk in front)
    this._z(g => {
      g.fillRect(178, 296, 34, 126);
      g.fillEllipse(195, 422, 50, 26);
    }, new Phaser.Geom.Rectangle(170, 296, 50, 152), Phaser.Geom.Rectangle.Contains);
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
    // Tusks — small curved arcs at jaw level, outside the trunk
    g.lineStyle(3, 0x000000, 1);
    g.strokePoints([{ x: 164, y: 300 }, { x: 156, y: 320 }, { x: 164, y: 342 }], false);
    g.strokePoints([{ x: 226, y: 300 }, { x: 234, y: 320 }, { x: 226, y: 342 }], false);
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
  // cy=205 keeps mane top at y=107 and legs bottom at y=512, both within parchment
  _zones_lion() {
    const cx = 195, cy = 205;
    // Mane (outer ring)
    this._z(g => g.fillCircle(cx, cy, 98),
      new Phaser.Geom.Circle(cx, cy, 98), Phaser.Geom.Circle.Contains);
    // Face
    this._z(g => g.fillCircle(cx, cy, 66),
      new Phaser.Geom.Circle(cx, cy, 66), Phaser.Geom.Circle.Contains);
    // Muzzle
    this._z(g => g.fillEllipse(cx, cy + 28, 66, 44),
      new Phaser.Geom.Ellipse(cx, cy + 28, 66, 44), Phaser.Geom.Ellipse.Contains);
    // Body — center y=338 so body top (278) overlaps mane bottom (303) → seamless join
    this._z(g => g.fillEllipse(cx, 338, 158, 122),
      new Phaser.Geom.Ellipse(cx, 338, 158, 122), Phaser.Geom.Ellipse.Contains);
    // Front legs — start inside body, bottom y=462
    this._z(g => {
      g.fillRect(148, 390, 40, 72);
      g.fillRect(207, 390, 40, 72);
    }, new Phaser.Geom.Rectangle(148, 390, 99, 72), Phaser.Geom.Rectangle.Contains);
    // Tail tuft
    this._z(g => g.fillCircle(266, 322, 22),
      new Phaser.Geom.Circle(266, 322, 22), Phaser.Geom.Circle.Contains);
  }

  _draw_lion(g) {
    const cx = 195, cy = 205, ls = 3.5;
    // Mane
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(cx, cy, 98);
    // Mane texture spokes
    g.lineStyle(2, 0x000000, 0.4);
    for (let a = 0; a < 360; a += 24) {
      const r = a * Math.PI / 180;
      g.lineBetween(cx + Math.cos(r) * 68, cy + Math.sin(r) * 68,
        cx + Math.cos(r) * 95, cy + Math.sin(r) * 95);
    }
    // Ears (triangles peeking above mane)
    g.lineStyle(ls, 0x000000, 1);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(cx - 68, cy - 68, cx - 46, cy - 68, cx - 57, cy - 95);
    g.fillTriangle(cx + 46, cy - 68, cx + 68, cy - 68, cx + 57, cy - 95);
    g.strokeTriangle(cx - 68, cy - 68, cx - 46, cy - 68, cx - 57, cy - 95);
    g.strokeTriangle(cx + 46, cy - 68, cx + 68, cy - 68, cx + 57, cy - 95);
    // Face
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(cx, cy, 66);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(cx - 22, cy - 14, 9);
    g.fillCircle(cx + 22, cy - 14, 9);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 19, cy - 17, 3);
    g.fillCircle(cx + 19, cy - 17, 3);
    // Muzzle
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx, cy + 28, 66, 44);
    // Nose
    g.fillStyle(0x000000, 1);
    g.fillTriangle(cx - 8, cy + 12, cx + 8, cy + 12, cx, cy + 22);
    // Mouth
    g.lineStyle(2.5, 0x000000, 1);
    g.lineBetween(cx, cy + 22, cx, cy + 31);
    g.lineBetween(cx, cy + 31, cx - 14, cy + 38);
    g.lineBetween(cx, cy + 31, cx + 14, cy + 38);
    // Whiskers
    g.lineStyle(2, 0x000000, 0.8);
    g.lineBetween(cx - 76, cy + 18, cx - 30, cy + 24);
    g.lineBetween(cx - 76, cy + 28, cx - 30, cy + 30);
    g.lineBetween(cx - 74, cy + 38, cx - 30, cy + 36);
    g.lineBetween(cx + 76, cy + 18, cx + 30, cy + 24);
    g.lineBetween(cx + 76, cy + 28, cx + 30, cy + 30);
    g.lineBetween(cx + 74, cy + 38, cx + 30, cy + 36);
    // Body — top (y=277) overlaps mane bottom (y=303): seamless connection
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx, 338, 158, 122);
    // Front legs
    g.strokeRect(148, 390, 40, 72);
    g.strokeRect(207, 390, 40, 72);
    // Paws
    g.lineStyle(2.5, 0x000000, 1);
    g.strokeEllipse(168, 464, 46, 16);
    g.strokeEllipse(227, 464, 46, 16);
    // Claw lines
    g.lineStyle(2, 0x000000, 0.5);
    [152, 162, 172].forEach(px => g.lineBetween(px, 462, px, 471));
    [211, 221, 231].forEach(px => g.lineBetween(px, 462, px, 471));
    // Tail curve + tuft
    g.lineStyle(ls, 0x000000, 1);
    g.strokePoints([{ x: 264, y: 300 }, { x: 276, y: 314 }, { x: 270, y: 328 }], false);
    g.strokeCircle(266, 322, 22);
    g.lineStyle(2, 0x000000, 0.4);
    for (let a = 0; a < 360; a += 30) {
      const r = a * Math.PI / 180;
      g.lineBetween(266 + Math.cos(r) * 17, 322 + Math.sin(r) * 17,
        266 + Math.cos(r) * 24, 322 + Math.sin(r) * 24);
    }
  }

  // ─── RABBIT ────────────────────────────────────────────────────────────────
  // Ears centered at y=145 (top y=83), head at y=258 (top y=193) — only 12px overlap at base
  _zones_rabbit() {
    const cx = 195;
    // Left outer ear — sits above head, base just touches head crown
    this._z(g => g.fillEllipse(155, 145, 52, 124),
      new Phaser.Geom.Ellipse(155, 145, 52, 124), Phaser.Geom.Ellipse.Contains);
    // Right outer ear
    this._z(g => g.fillEllipse(235, 145, 52, 124),
      new Phaser.Geom.Ellipse(235, 145, 52, 124), Phaser.Geom.Ellipse.Contains);
    // Left inner ear (pink)
    this._z(g => g.fillEllipse(155, 143, 28, 84),
      new Phaser.Geom.Ellipse(155, 143, 28, 84), Phaser.Geom.Ellipse.Contains);
    // Right inner ear (pink)
    this._z(g => g.fillEllipse(235, 143, 28, 84),
      new Phaser.Geom.Ellipse(235, 143, 28, 84), Phaser.Geom.Ellipse.Contains);
    // Head — top y=193 meets ear bottom y=207 (small overlap at base only)
    this._z(g => g.fillCircle(cx, 258, 65),
      new Phaser.Geom.Circle(cx, 258, 65), Phaser.Geom.Circle.Contains);
    // Muzzle
    this._z(g => g.fillEllipse(cx, 290, 60, 42),
      new Phaser.Geom.Ellipse(cx, 290, 60, 42), Phaser.Geom.Ellipse.Contains);
    // Body
    this._z(g => g.fillEllipse(cx, 410, 170, 192),
      new Phaser.Geom.Ellipse(cx, 410, 170, 192), Phaser.Geom.Ellipse.Contains);
    // Tail
    this._z(g => g.fillCircle(302, 382, 28),
      new Phaser.Geom.Circle(302, 382, 28), Phaser.Geom.Circle.Contains);
    // Front paws
    this._z(g => {
      g.fillEllipse(155, 504, 64, 28);
      g.fillEllipse(235, 504, 64, 28);
    }, new Phaser.Geom.Rectangle(123, 492, 144, 40), Phaser.Geom.Rectangle.Contains);
  }

  _draw_rabbit(g) {
    const cx = 195, ls = 3.5;
    // Outer ears (drawn first so head outline goes on top)
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(155, 145, 52, 124);
    g.strokeEllipse(235, 145, 52, 124);
    // Inner ears
    g.lineStyle(2, 0x000000, 0.55);
    g.strokeEllipse(155, 143, 28, 84);
    g.strokeEllipse(235, 143, 28, 84);
    // Head (outline drawn over ear base for clean look)
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(cx, 258, 65);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(cx - 24, 244, 10);
    g.fillCircle(cx + 24, 244, 10);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 20, 241, 4);
    g.fillCircle(cx + 20, 241, 4);
    // Nose
    g.fillStyle(0x000000, 1);
    g.fillEllipse(cx, 276, 12, 9);
    // Muzzle
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx, 290, 60, 42);
    // Mouth
    g.lineStyle(2.5, 0x000000, 1);
    g.lineBetween(cx, 281, cx, 291);
    g.lineBetween(cx, 291, cx - 15, 299);
    g.lineBetween(cx, 291, cx + 15, 299);
    // Whiskers
    g.lineStyle(2, 0x000000, 0.8);
    g.lineBetween(cx - 80, 284, cx - 28, 287);
    g.lineBetween(cx - 80, 293, cx - 28, 291);
    g.lineBetween(cx + 28, 287, cx + 80, 284);
    g.lineBetween(cx + 28, 291, cx + 80, 293);
    // Body
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(cx, 410, 170, 192);
    // Belly tuft
    g.lineStyle(2, 0x000000, 0.42);
    g.strokeEllipse(cx, 402, 86, 116);
    // Tail
    g.lineStyle(ls, 0x000000, 1);
    g.strokeCircle(302, 382, 28);
    g.lineStyle(2, 0x000000, 0.4);
    for (let a = 0; a < 360; a += 30) {
      const r = a * Math.PI / 180;
      g.lineBetween(302 + Math.cos(r) * 22, 382 + Math.sin(r) * 22,
        302 + Math.cos(r) * 30, 382 + Math.sin(r) * 30);
    }
    // Paws
    g.lineStyle(ls, 0x000000, 1);
    g.strokeEllipse(155, 504, 64, 28);
    g.strokeEllipse(235, 504, 64, 28);
    // Toe lines
    g.lineStyle(2, 0x000000, 0.5);
    [131, 143, 155, 167].forEach(px => g.lineBetween(px, 502, px, 516));
    [211, 223, 235, 247].forEach(px => g.lineBetween(px, 502, px, 516));
  }

  // ─── GIRAFFE ────────────────────────────────────────────────────────────────
  _zones_giraffe() {
    const cx = 195;
    this._z(g => {
      g.fillRect(108,476,30,49); g.fillRect(150,476,30,49);
      g.fillRect(230,476,30,49); g.fillRect(272,476,30,49);
    }, new Phaser.Geom.Rectangle(108,476,194,49), Phaser.Geom.Rectangle.Contains);
    this._z(g => g.fillEllipse(cx,428,185,112),
      new Phaser.Geom.Ellipse(cx,428,185,112), Phaser.Geom.Ellipse.Contains);
    this._z(g => g.fillRect(173,162,44,248),
      new Phaser.Geom.Rectangle(173,162,44,248), Phaser.Geom.Rectangle.Contains);
    this._z(g => {
      g.fillCircle(cx,120,42);
      g.fillEllipse(157,106,22,34); g.fillEllipse(233,106,22,34);
    }, new Phaser.Geom.Circle(cx,120,62), Phaser.Geom.Circle.Contains);
  }

  _draw_giraffe(g) {
    const cx = 195, ls = 3.5;
    g.lineStyle(ls, 0x000000, 1);
    [[108],[150],[230],[272]].forEach(([lx]) => g.strokeRect(lx,476,30,49));
    g.lineStyle(2,0x000000,0.5);
    [[108],[150],[230],[272]].forEach(([lx]) => g.lineBetween(lx+4,516,lx+26,516));
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(cx,428,185,112);
    g.lineStyle(3,0x000000,1);
    g.strokePoints([{x:284,y:388},{x:298,y:408},{x:284,y:428},{x:296,y:446}],false);
    g.lineStyle(2.5,0x000000,0.65);
    [[cx-20,398],[cx+44,408],[cx-50,426],[cx+20,440],[cx-8,456]].forEach(([sx,sy])=>g.strokeEllipse(sx,sy,30,22));
    g.lineStyle(ls,0x000000,1);
    g.lineBetween(173,162,173,420); g.lineBetween(217,162,217,420);
    g.lineStyle(2.5,0x000000,0.65);
    [[cx-10,225],[cx+10,258],[cx-8,292],[cx+6,326]].forEach(([sx,sy])=>g.strokeEllipse(sx,sy,28,20));
    g.lineStyle(ls,0x000000,1);
    g.strokeCircle(cx,120,42);
    g.strokeEllipse(157,106,22,34); g.strokeEllipse(233,106,22,34);
    g.lineStyle(2,0x000000,0.5);
    g.strokeEllipse(157,106,12,20); g.strokeEllipse(233,106,12,20);
    g.fillStyle(0x000000,1);
    g.fillCircle(cx-16,113,6); g.fillCircle(cx+16,113,6);
    g.fillStyle(0xffffff,1);
    g.fillCircle(cx-14,111,2.5); g.fillCircle(cx+14,111,2.5);
    g.fillStyle(0x000000,0.55);
    g.fillEllipse(cx-8,136,9,6); g.fillEllipse(cx+8,136,9,6);
    // Mane dots down neck centre
    g.fillStyle(0x000000,0.45);
    for (let my=162; my<415; my+=18) g.fillRect(cx-2,my,4,10);
  }

  // ─── ZEBRA ──────────────────────────────────────────────────────────────────
  _zones_zebra() {
    const cx = 195;
    this._z(g => {
      g.fillRect(112,456,32,69); g.fillRect(154,456,32,69);
      g.fillRect(224,456,32,69); g.fillRect(266,456,32,69);
    }, new Phaser.Geom.Rectangle(112,456,186,69), Phaser.Geom.Rectangle.Contains);
    this._z(g => g.fillEllipse(cx,388,186,136),
      new Phaser.Geom.Ellipse(cx,388,186,136), Phaser.Geom.Ellipse.Contains);
    this._z(g => {
      g.fillCircle(cx,216,58);
      g.fillEllipse(cx-40,172,20,38); g.fillEllipse(cx+40,172,20,38);
    }, new Phaser.Geom.Circle(cx,216,74), Phaser.Geom.Circle.Contains);
  }

  _draw_zebra(g) {
    const cx = 195, ls = 3.5;
    g.lineStyle(ls,0x000000,1);
    [[112],[154],[224],[266]].forEach(([lx]) => g.strokeRect(lx,456,32,69));
    g.fillStyle(0x000000,0.9);
    [[112],[154],[224],[266]].forEach(([lx]) => {
      g.fillRect(lx,468,32,9); g.fillRect(lx,486,32,9); g.fillRect(lx,504,32,9);
    });
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(cx,388,186,136);
    g.fillStyle(0x000000,0.88);
    [[cx-84,338,22,100],[cx-58,324,20,100],[cx-30,320,18,32],[cx-30,378,18,46],
     [cx+2,320,18,32],[cx+2,380,18,46],[cx+34,326,20,98],[cx+62,338,22,96]
    ].forEach(([sx,sy,sw,sh]) => g.fillRect(sx,sy,sw,sh));
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(cx,388,186,136);
    g.lineStyle(3,0x000000,1);
    g.strokePoints([{x:283,y:340},{x:296,y:360},{x:282,y:383}],false);
    g.lineStyle(ls,0x000000,1);
    g.strokeCircle(cx,216,58);
    g.strokeEllipse(cx-40,172,20,38); g.strokeEllipse(cx+40,172,20,38);
    g.lineStyle(2,0x000000,0.5);
    g.strokeEllipse(cx-40,172,10,22); g.strokeEllipse(cx+40,172,10,22);
    g.fillStyle(0x000000,0.88);
    [[cx-48,193,14,46],[cx-28,183,14,52],[cx-8,181,14,52],
     [cx+12,183,14,52],[cx+32,193,14,46]].forEach(([sx,sy,sw,sh]) => g.fillRect(sx,sy,sw,sh));
    g.lineStyle(ls,0x000000,1);
    g.strokeCircle(cx,216,58);
    g.fillStyle(0x000000,1);
    g.fillCircle(cx-22,208,7); g.fillCircle(cx+22,208,7);
    g.fillStyle(0xffffff,1);
    g.fillCircle(cx-20,206,3); g.fillCircle(cx+20,206,3);
    g.fillStyle(0x000000,1);
    g.fillEllipse(cx-8,246,11,8); g.fillEllipse(cx+8,246,11,8);
    g.lineStyle(2.5,0x000000,1);
    g.strokePoints([{x:cx-10,y:253},{x:cx,y:260},{x:cx+10,y:253}],false);
    // Zigzag mane
    g.lineStyle(3,0x000000,0.8);
    const mane=[];
    for (let mi=0;mi<=9;mi++) mane.push({x:cx+(mi%2===0?-9:9),y:158+mi*16});
    g.strokePoints(mane,false);
  }

  // ─── ARK ───────────────────────────────────────────────────────────────────
  _zones_ark() {
    const cx = 195;
    // Roof — created first so the cabins (created later) render above it and
    // win input where they overlap; tapping the cabin no longer paints the roof
    this._z(g => g.fillTriangle(46, 278, 344, 278, cx, 148),
      new Phaser.Geom.Triangle(46, 278, 344, 278, cx, 148), Phaser.Geom.Triangle.Contains);
    // Hull
    this._z(g => g.fillRect(34, 382, 322, 116),
      new Phaser.Geom.Rectangle(34, 382, 322, 116), Phaser.Geom.Rectangle.Contains);
    // Main cabin
    this._z(g => g.fillRect(56, 278, 278, 108),
      new Phaser.Geom.Rectangle(56, 278, 278, 108), Phaser.Geom.Rectangle.Contains);
    // Upper cabin
    this._z(g => g.fillRect(108, 198, 174, 84),
      new Phaser.Geom.Rectangle(108, 198, 174, 84), Phaser.Geom.Rectangle.Contains);
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

  // ─── MONKEY ─────────────────────────────────────────────────────────────────
  _zones_monkey() {
    const cx = 195;
    this._z(g => { g.fillEllipse(112,356,58,108); g.fillEllipse(278,356,58,108); },
      new Phaser.Geom.Rectangle(83,302,224,108), Phaser.Geom.Rectangle.Contains);
    this._z(g => g.fillEllipse(cx,406,172,152),
      new Phaser.Geom.Ellipse(cx,406,172,152), Phaser.Geom.Ellipse.Contains);
    this._z(g => g.fillCircle(cx,236,62),
      new Phaser.Geom.Circle(cx,236,62), Phaser.Geom.Circle.Contains);
    // Ears as individual circles — a shared rectangle would steal taps from the face
    this._z(g => g.fillCircle(cx-72,239,28),
      new Phaser.Geom.Circle(cx-72,239,28), Phaser.Geom.Circle.Contains);
    this._z(g => g.fillCircle(cx+72,239,28),
      new Phaser.Geom.Circle(cx+72,239,28), Phaser.Geom.Circle.Contains);
    this._z(g => g.fillEllipse(cx,261,80,66),
      new Phaser.Geom.Ellipse(cx,261,80,66), Phaser.Geom.Ellipse.Contains);
  }

  _draw_monkey(g) {
    const cx = 195, ls = 3.5;
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(112,356,58,108); g.strokeEllipse(278,356,58,108);
    g.fillStyle(0xffffff,1);
    g.fillCircle(112,410,18); g.fillCircle(278,410,18);
    g.lineStyle(ls,0x000000,1);
    g.strokeCircle(112,410,18); g.strokeCircle(278,410,18);
    g.lineStyle(2,0x000000,0.55);
    [-8,-2,4,10].forEach(dx => { g.lineBetween(112+dx,396,112+dx,405); g.lineBetween(278+dx,396,278+dx,405); });
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(cx,406,172,152);
    g.lineStyle(2,0x000000,0.4);
    g.strokeEllipse(cx,416,94,108);
    g.lineStyle(ls,0x000000,1);
    g.strokeCircle(cx,236,62);
    g.strokeCircle(cx-72,239,28); g.strokeCircle(cx+72,239,28);
    g.lineStyle(2,0x000000,0.5);
    g.strokeCircle(cx-72,239,16); g.strokeCircle(cx+72,239,16);
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(cx,261,80,66);
    g.fillStyle(0x000000,1);
    g.fillCircle(cx-20,229,8); g.fillCircle(cx+20,229,8);
    g.fillStyle(0xffffff,1);
    g.fillCircle(cx-18,227,3); g.fillCircle(cx+18,227,3);
    g.fillStyle(0x000000,0.7);
    g.fillEllipse(cx-6,254,10,8); g.fillEllipse(cx+6,254,10,8);
    g.lineStyle(2.5,0x000000,1);
    g.strokePoints([{x:cx-12,y:269},{x:cx,y:277},{x:cx+12,y:269}],false);
    g.lineStyle(3.5,0x000000,1);
    g.strokePoints([{x:278,y:480},{x:304,y:460},{x:314,y:438},{x:304,y:416},{x:318,y:398}],false);
  }

  // ─── PENGUIN ─────────────────────────────────────────────────────────────────
  _zones_penguin() {
    const cx = 195;
    this._z(g => { g.fillEllipse(cx,388,155,248); g.fillEllipse(cx-96,358,56,128); g.fillEllipse(cx+96,358,56,128); },
      new Phaser.Geom.Rectangle(68,264,254,256), Phaser.Geom.Rectangle.Contains);
    this._z(g => g.fillCircle(cx,187,63),
      new Phaser.Geom.Circle(cx,187,63), Phaser.Geom.Circle.Contains);
    this._z(g => g.fillEllipse(cx,403,88,170),
      new Phaser.Geom.Ellipse(cx,403,88,170), Phaser.Geom.Ellipse.Contains);
    this._z(g => g.fillTriangle(cx-14,243,cx+14,243,cx,270),
      new Phaser.Geom.Triangle(cx-14,243,cx+14,243,cx,270), Phaser.Geom.Triangle.Contains);
    // Feet — drawn in the outline but previously not colorable
    this._z(g => { g.fillEllipse(cx-30,517,46,20); g.fillEllipse(cx+30,517,46,20); },
      new Phaser.Geom.Rectangle(cx-53,507,106,20), Phaser.Geom.Rectangle.Contains);
  }

  _draw_penguin(g) {
    const cx = 195, ls = 3.5;
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(cx,388,155,248);
    g.strokeEllipse(cx-96,358,56,128); g.strokeEllipse(cx+96,358,56,128);
    g.strokeEllipse(cx-30,517,46,20); g.strokeEllipse(cx+30,517,46,20);
    g.strokeEllipse(cx,403,88,170);
    g.strokeCircle(cx,187,63);
    g.fillStyle(0xffffff,1);
    g.fillCircle(cx-34,198,16); g.fillCircle(cx+34,198,16);
    g.lineStyle(2,0x000000,0.45);
    g.strokeCircle(cx-34,198,16); g.strokeCircle(cx+34,198,16);
    g.fillStyle(0x000000,1);
    g.fillCircle(cx-18,176,9); g.fillCircle(cx+18,176,9);
    g.fillStyle(0xffffff,1);
    g.fillCircle(cx-15,173,4); g.fillCircle(cx+15,173,4);
    g.lineStyle(ls,0x000000,1);
    g.strokeTriangle(cx-14,243,cx+14,243,cx,270);
    g.lineStyle(2,0x000000,0.5);
    g.lineBetween(cx-14,243,cx+14,243);
  }

  // ─── BEAR ────────────────────────────────────────────────────────────────────
  _zones_bear() {
    const cx = 195;
    this._z(g => { g.fillEllipse(cx-96,386,52,88); g.fillEllipse(cx+96,386,52,88); },
      new Phaser.Geom.Rectangle(cx-122,342,244,88), Phaser.Geom.Rectangle.Contains);
    this._z(g => { g.fillEllipse(cx-30,489,56,28); g.fillEllipse(cx+30,489,56,28); },
      new Phaser.Geom.Rectangle(cx-58,475,116,28), Phaser.Geom.Rectangle.Contains);
    this._z(g => g.fillEllipse(cx,410,178,160),
      new Phaser.Geom.Ellipse(cx,410,178,160), Phaser.Geom.Ellipse.Contains);
    // Ears as individual circles — a shared rectangle would steal taps from the forehead
    this._z(g => g.fillCircle(cx-62,162,32),
      new Phaser.Geom.Circle(cx-62,162,32), Phaser.Geom.Circle.Contains);
    this._z(g => g.fillCircle(cx+62,162,32),
      new Phaser.Geom.Circle(cx+62,162,32), Phaser.Geom.Circle.Contains);
    this._z(g => g.fillCircle(cx,231,70),
      new Phaser.Geom.Circle(cx,231,70), Phaser.Geom.Circle.Contains);
    this._z(g => g.fillCircle(cx-62,162,18),
      new Phaser.Geom.Circle(cx-62,162,18), Phaser.Geom.Circle.Contains);
    this._z(g => g.fillCircle(cx+62,162,18),
      new Phaser.Geom.Circle(cx+62,162,18), Phaser.Geom.Circle.Contains);
    this._z(g => g.fillEllipse(cx,268,76,52),
      new Phaser.Geom.Ellipse(cx,268,76,52), Phaser.Geom.Ellipse.Contains);
  }

  _draw_bear(g) {
    const cx = 195, ls = 3.5;
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(cx-30,489,56,28); g.strokeEllipse(cx+30,489,56,28);
    g.lineStyle(2,0x000000,0.5);
    [-14,-4,6,16].forEach(dx => { g.lineBetween(cx-30+dx,479,cx-30+dx,489); g.lineBetween(cx+30+dx,479,cx+30+dx,489); });
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(cx-96,386,52,88); g.strokeEllipse(cx+96,386,52,88);
    g.strokeEllipse(cx,410,178,160);
    g.lineStyle(2,0x000000,0.4);
    g.strokeEllipse(cx,418,96,112);
    g.lineStyle(ls,0x000000,1);
    g.strokeCircle(cx-62,162,32); g.strokeCircle(cx+62,162,32);
    g.lineStyle(2,0x000000,0.55);
    g.strokeCircle(cx-62,162,18); g.strokeCircle(cx+62,162,18);
    g.lineStyle(ls,0x000000,1);
    g.strokeCircle(cx,231,70);
    g.fillStyle(0x000000,1);
    g.fillCircle(cx-24,217,9); g.fillCircle(cx+24,217,9);
    g.fillStyle(0xffffff,1);
    g.fillCircle(cx-21,214,4); g.fillCircle(cx+21,214,4);
    g.lineStyle(ls,0x000000,1);
    g.strokeEllipse(cx,268,76,52);
    g.fillStyle(0x000000,1);
    g.fillEllipse(cx,251,22,14);
    g.lineStyle(2.5,0x000000,1);
    g.lineBetween(cx,258,cx,270);
    g.lineBetween(cx,270,cx-14,279); g.lineBetween(cx,270,cx+14,279);
  }

  _draw_ark(g) {
    const cx = 195, ls = 3.5;
    // Roof — drawn first so cabin outlines sit on top of it
    g.lineStyle(ls, 0x000000, 1);
    g.strokeTriangle(46, 278, 344, 278, cx, 148);
    g.lineStyle(2, 0x000000, 0.38);
    for (let i = 1; i <= 4; i++) {
      const ty = 148 + (278 - 148) * i / 5;
      const hw = (344 - 46) / 2 * i / 5;
      if (ty < 198) {
        g.lineBetween(cx - hw, ty, cx + hw, ty);
      } else {
        // Clip plank lines so they don't scribble across the upper cabin
        if (cx - hw < 102) g.lineBetween(cx - hw, ty, 108, ty);
        if (cx + hw > 288) g.lineBetween(282, ty, cx + hw, ty);
      }
    }
    // Flag pole + flag
    g.lineStyle(3, 0x000000, 1);
    g.lineBetween(cx, 148, cx, 108);
    g.strokeTriangle(cx, 108, cx + 32, 120, cx, 134);
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
