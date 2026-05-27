import { drawNoah, drawArk, drawAnimal, drawBackground, drawWater, drawRainDrop, drawCoin } from '../utils/Graphics.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Generate all game textures programmatically — no external assets needed
    this.generateTextures();

    // Loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const barBg = this.add.rectangle(width / 2, height / 2, 300, 30, 0x333333, 0.8).setOrigin(0.5);
    const bar = this.add.rectangle(width / 2 - 148, height / 2, 4, 22, 0xffdd00).setOrigin(0, 0.5);

    const loadText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.width = 296 * value;
    });
  }

  generateTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Sky background
    drawBackground(g);
    g.generateTexture('background', 390, 844);
    g.clear();

    // Water strip
    drawWater(g);
    g.generateTexture('water', 390, 120);
    g.clear();

    // Noah character
    drawNoah(g);
    g.generateTexture('noah', 48, 64);
    g.clear();

    // Ark
    drawArk(g);
    g.generateTexture('ark', 120, 100);
    g.clear();

    // Animals — 8 types, each 40x40
    const animals = ['elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear'];
    const colors = [0x888888, 0xf5c542, 0xd4a017, 0xeeeeee, 0xb5651d, 0xffffff, 0x2c3e50, 0x8b4513];
    animals.forEach((name, i) => {
      g.clear();
      drawAnimal(g, colors[i], name);
      g.generateTexture(name, 40, 40);
    });
    g.clear();

    // Rain drop
    drawRainDrop(g);
    g.generateTexture('raindrop', 6, 14);
    g.clear();

    // Coin / star collectible
    drawCoin(g);
    g.generateTexture('star', 28, 28);
    g.clear();

    g.destroy();
  }

  create() {
    this.scene.start('Menu');
  }
}
