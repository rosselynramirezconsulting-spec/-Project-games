import { LOCATIONS, drawPlanet, buildCharacter } from './Draw.js';
import { loadState, saveState } from './Store.js';
import { Sound } from './Sound.js';

// The map screen: a little planet with one pin per location. Tap a pin to
// drop into that place and start playing. Mirrors Toca World's globe menu.
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  create() {
    const { width, height } = this.scale;
    this.state = loadState();

    // Sky backdrop
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xd6eefc, 0xd6eefc, 1);
    bg.fillRect(0, 0, width, height);
    this.drawClouds(width);

    // Title
    this.add.text(width / 2, 70, 'TINY', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '46px',
      color: '#ffffff', stroke: '#1a6bb5', strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(width / 2, 116, 'TOWN', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '38px',
      color: '#ffd93d', stroke: '#d17a00', strokeThickness: 7,
    }).setOrigin(0.5);

    // Planet
    const cx = width / 2;
    const cy = height * 0.52;
    const r = Math.min(width, height) * 0.34;
    const planet = this.add.graphics();
    drawPlanet(planet, cx, cy, r);
    this.tweens.add({ targets: planet, y: '+=8', duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Tiny waving character on the planet
    const hero = buildCharacter(this, this.state.character);
    hero.container.setScale(0.55).setPosition(cx, cy - r * 0.35);
    this.tweens.add({ targets: hero.container, angle: { from: -4, to: 4 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    if (this.state.character.name) {
      this.add.text(cx, cy - r * 0.35 + 40, this.state.character.name, {
        fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '16px',
        color: '#1a6bb5', backgroundColor: '#ffffffcc', padding: { x: 8, y: 2 },
      }).setOrigin(0.5);
    }

    // Location pins evenly ringed around the planet
    const pinR = r + 30;
    const n = LOCATIONS.length;
    LOCATIONS.forEach((loc, i) => {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(ang) * pinR;
      const py = cy + Math.sin(ang) * pinR;
      this.makePin(px, py, loc);
    });

    // Hint
    this.add.text(width / 2, height - 70, 'Toca un lugar para jugar', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '18px',
      color: '#1a6bb5',
    }).setOrigin(0.5);

    // Wardrobe shortcut
    this.makeButton(width / 2, height - 36, '👕  Vestir personaje', 0x9b6bff, () => {
      Sound.open();
      this.scene.start('Wardrobe', { from: 'World' });
    });
  }

  makePin(x, y, loc) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    // Pin body
    g.fillStyle(0xffffff, 1);
    g.fillCircle(0, 0, 30);
    g.lineStyle(4, loc.accent, 1);
    g.strokeCircle(0, 0, 30);
    g.fillStyle(loc.accent, 1);
    g.fillTriangle(-8, 26, 8, 26, 0, 42);
    c.add(g);

    const icons = { house: '🏠', bedroom: '🛏️', kitchen: '🍳', park: '🌳', beach: '🏖️', shop: '🛍️' };
    const icon = this.add.text(0, -2, icons[loc.key] || '⭐', { fontSize: '26px' }).setOrigin(0.5);
    const label = this.add.text(0, 50, loc.name, {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '15px',
      color: '#1a6bb5', backgroundColor: '#ffffffcc', padding: { x: 6, y: 2 },
    }).setOrigin(0.5);
    c.add([icon, label]);

    c.setSize(60, 60);
    c.setInteractive(new Phaser.Geom.Circle(0, 0, 34), Phaser.Geom.Circle.Contains);
    c.on('pointerover', () => c.setScale(1.12));
    c.on('pointerout', () => c.setScale(1));
    c.on('pointerdown', () => {
      Sound.open();
      this.state.location = loc.key;
      saveState(this.state);
      this.scene.start('Room', { location: loc.key });
    });

    this.tweens.add({ targets: c, y: y - 6, duration: 1200 + Math.random() * 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  makeButton(x, y, text, color, onClick) {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '17px',
      color: '#ffffff', backgroundColor: '#' + color.toString(16).padStart(6, '0'),
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    t.on('pointerover', () => t.setScale(1.06));
    t.on('pointerout', () => t.setScale(1));
    t.on('pointerdown', onClick);
    return t;
  }

  drawClouds(width) {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.7);
    g.fillEllipse(width * 0.2, 180, 90, 36);
    g.fillEllipse(width * 0.78, 230, 110, 40);
    g.fillEllipse(width * 0.5, 300, 70, 28);
  }
}
