import { buildCharacter } from './Draw.js';
import { loadState } from './Store.js';
import { Sound } from './Sound.js';

// Title screen: big logo, your character waving, and a Play button.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.scale;
    const state = loadState();

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xd6eefc, 0xd6eefc, 1);
    bg.fillRect(0, 0, width, height);

    // Clouds
    const cl = this.add.graphics();
    cl.fillStyle(0xffffff, 0.75);
    cl.fillEllipse(width * 0.24, 150, 100, 40);
    cl.fillEllipse(width * 0.76, 210, 120, 44);

    // Logo
    this.add.text(width / 2, height * 0.22, 'TINY', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '64px',
      color: '#ffffff', stroke: '#1a6bb5', strokeThickness: 10,
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.30, 'TOWN', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '54px',
      color: '#ffd93d', stroke: '#d17a00', strokeThickness: 9,
    }).setOrigin(0.5);

    // Character preview
    const hero = buildCharacter(this, state.character);
    hero.container.setPosition(width / 2, height * 0.55).setScale(1.5);
    this.tweens.add({
      targets: hero.container, y: hero.container.y - 14,
      duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
    if (state.character.name) {
      this.add.text(width / 2, height * 0.55 + 110, state.character.name, {
        fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '20px',
        color: '#1a6bb5', backgroundColor: '#ffffffcc', padding: { x: 10, y: 3 },
      }).setOrigin(0.5);
    }

    // Play button
    this.bigButton(width / 2, height * 0.80, '▶  Jugar', 0x6bc36b, () => {
      Sound.start();
      this.scene.start('World');
    });
    // Wardrobe button
    this.bigButton(width / 2, height * 0.89, '👕  Vestir', 0x9b6bff, () => {
      Sound.open();
      this.scene.start('Wardrobe', { from: 'World' });
    });

    this.add.text(width / 2, height - 22, 'Un mundo para crear y jugar', {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '15px', color: '#1a6bb5',
    }).setOrigin(0.5);
  }

  bigButton(x, y, text, color, onClick) {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '26px',
      color: '#ffffff', backgroundColor: '#' + color.toString(16).padStart(6, '0'),
      padding: { x: 30, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    t.on('pointerover', () => t.setScale(1.06));
    t.on('pointerout', () => t.setScale(1));
    t.on('pointerdown', onClick);
    return t;
  }
}
