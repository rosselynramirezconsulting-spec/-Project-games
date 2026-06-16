import {
  buildCharacter, SKIN_TONES, HAIR_COLORS, SHIRT_COLORS, PANTS_COLORS, SHOE_COLORS, PRESETS,
} from './Draw.js';
import { loadState, saveState } from './Store.js';
import { Sound } from './Sound.js';

// Character customization, Toca-style. Pick a ready-made character (Elizabeth /
// Cristian) or tweak skin, hair color & style, shirt, pants, shoes and an
// optional hat. Live preview, saved on "Listo".
export default class WardrobeScene extends Phaser.Scene {
  constructor() {
    super('Wardrobe');
  }

  init(data) {
    this.from = data.from || 'World';
    this.location = data.location || 'house';
  }

  create() {
    const { width, height } = this.scale;
    this.state = loadState();
    this.refreshers = [];

    const bg = this.add.graphics();
    bg.fillGradientStyle(0xfff3e0, 0xfff3e0, 0xffe0b2, 0xffe0b2, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 38, 'Vestidor', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '28px',
      color: '#9b6bff', stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5);

    // Live preview
    this.hero = buildCharacter(this, this.state.character);
    this.hero.container.setPosition(width / 2, 178).setScale(1.15);

    // Name under the preview
    this.nameLabel = this.add.text(width / 2, 244, '', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '20px',
      color: '#5d4037',
    }).setOrigin(0.5);
    this.refreshName();

    // Ready-made character chooser
    const presetY = 76;
    PRESETS.forEach((p, i) => {
      const x = width / 2 + (i === 0 ? -78 : 78);
      const btn = this.add.text(x, presetY, p.name, {
        fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '16px',
        color: '#ffffff', backgroundColor: '#ff7ab8', padding: { x: 14, y: 7 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setScale(1.08));
      btn.on('pointerout', () => btn.setScale(1));
      btn.on('pointerdown', () => this.loadPreset(p));
    });

    // Option rows
    const rows = [
      { label: 'Piel', key: 'skin', count: SKIN_TONES.length, swatch: SKIN_TONES },
      { label: 'Pelo', key: 'hair', count: HAIR_COLORS.length, swatch: HAIR_COLORS },
      { label: 'Peinado', key: 'hairStyle', count: 3, swatch: null, names: ['Corto', 'Largo', 'Punk'] },
      { label: 'Camiseta', key: 'shirt', count: SHIRT_COLORS.length, swatch: SHIRT_COLORS },
      { label: 'Pantalón', key: 'pants', count: PANTS_COLORS.length, swatch: PANTS_COLORS },
      { label: 'Zapatos', key: 'shoe', count: SHOE_COLORS.length, swatch: SHOE_COLORS },
      { label: 'Gorro', key: 'hat', count: SHIRT_COLORS.length, swatch: SHIRT_COLORS, allowNone: true },
    ];

    let y = 290;
    rows.forEach((row) => {
      this.makeRow(width, y, row);
      y += 50;
    });

    // Done button
    const done = this.add.text(width / 2, height - 36, '✓  Listo', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '22px',
      color: '#ffffff', backgroundColor: '#6bc36b', padding: { x: 26, y: 11 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    done.on('pointerover', () => done.setScale(1.06));
    done.on('pointerout', () => done.setScale(1));
    done.on('pointerdown', () => {
      Sound.place();
      this.state.character = Object.assign({}, this.hero.cfg);
      saveState(this.state);
      if (this.from === 'Room') this.scene.start('Room', { location: this.location });
      else this.scene.start('World');
    });
  }

  refreshName() {
    this.nameLabel.setText(this.hero.cfg.name ? '🙂 ' + this.hero.cfg.name : '');
  }

  loadPreset(preset) {
    Sound.open();
    Object.keys(preset).forEach((k) => { this.hero.cfg[k] = preset[k]; });
    this.hero.setStyle('name', preset.name); // triggers a redraw
    this.refreshName();
    this.refreshers.forEach((fn) => fn());
  }

  makeRow(width, y, row) {
    this.add.text(28, y, row.label, {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '16px', color: '#5d4037',
    }).setOrigin(0, 0.5);

    const swatch = this.add.graphics();
    const styleText = row.swatch ? null : this.add.text(width / 2, y, '', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '15px', color: '#5d4037',
    }).setOrigin(0.5);

    const draw = () => {
      const val = this.hero.cfg[row.key];
      swatch.clear();
      swatch.fillStyle(0xffffff, 1);
      swatch.fillRoundedRect(width / 2 - 26, y - 15, 52, 30, 7);
      swatch.lineStyle(2, 0xbcaaa4, 1);
      swatch.strokeRoundedRect(width / 2 - 26, y - 15, 52, 30, 7);
      if (row.allowNone && val < 0) {
        swatch.lineStyle(3, 0xff5252, 1);
        swatch.beginPath();
        swatch.moveTo(width / 2 - 16, y - 9); swatch.lineTo(width / 2 + 16, y + 9);
        swatch.strokePath();
      } else if (row.swatch) {
        swatch.fillStyle(row.swatch[val], 1);
        swatch.fillRoundedRect(width / 2 - 20, y - 10, 40, 20, 5);
      } else if (styleText) {
        styleText.setText(row.names[val] || '');
      }
    };
    this.refreshers.push(draw);

    const cycle = (dir) => {
      let val = this.hero.cfg[row.key];
      const min = row.allowNone ? -1 : 0;
      val += dir;
      if (val >= row.count) val = min;
      if (val < min) val = row.count - 1;
      this.hero.setStyle(row.key, val);
      draw();
    };

    this.arrow(width / 2 - 68, y, '‹', () => cycle(-1));
    this.arrow(width / 2 + 68, y, '›', () => cycle(1));
    draw();
  }

  arrow(x, y, glyph, onClick) {
    const t = this.add.text(x, y, glyph, {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '30px',
      color: '#ffffff', backgroundColor: '#9b6bff', padding: { x: 11, y: 0 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    t.on('pointerover', () => t.setScale(1.12));
    t.on('pointerout', () => t.setScale(1));
    t.on('pointerdown', () => { Sound.tap(); onClick(); });
    return t;
  }
}
