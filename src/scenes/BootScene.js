import { drawNoah, drawArk, drawArkOpen, drawAnimal, drawBackground, drawWater, drawRainDrop, drawCoin, drawPlatform, drawIcePlatform, drawHeart } from '../utils/Graphics.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  // No preload needed — zero external files to fetch

  create() {
    this.generateTextures();
    this.scene.start('Menu');
  }

  generateTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    drawBackground(g);
    g.generateTexture('background', 390, 844);
    g.clear();

    drawWater(g);
    g.generateTexture('water', 390, 120);
    g.clear();

    drawNoah(g);
    g.generateTexture('noah', 48, 64);
    g.clear();

    drawArk(g);
    g.generateTexture('ark', 120, 100);
    g.clear();

    const animals = ['elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear'];
    const colors = [0x888888, 0xf5c542, 0xd4a017, 0xeeeeee, 0xb5651d, 0xffffff, 0x2c3e50, 0x8b4513];
    animals.forEach((name, i) => {
      g.clear();
      drawAnimal(g, colors[i], name);
      g.generateTexture(name, 40, 40);
    });

    g.clear();
    drawRainDrop(g);
    g.generateTexture('raindrop', 6, 14);

    g.clear();
    drawCoin(g);
    g.generateTexture('star', 28, 28);

    g.clear();
    drawPlatform(g);
    g.generateTexture('platform', 96, 18);

    g.clear();
    drawIcePlatform(g);
    g.generateTexture('iceplatform', 96, 18);

    g.clear();
    drawArkOpen(g);
    g.generateTexture('ark-open', 120, 100);

    g.clear();
    drawHeart(g);
    g.generateTexture('heart', 24, 24);

    g.clear();
    g.destroy();
  }
}
