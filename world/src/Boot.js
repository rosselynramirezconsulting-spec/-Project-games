import { ITEMS } from './Draw.js';

// Generates a texture for every furniture/decoration item, then starts the
// world map. Everything is procedural, so there is nothing to download.
export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    ITEMS.forEach((item) => {
      g.clear();
      item.draw(g);
      g.generateTexture(item.key, item.w, item.h);
    });
    g.destroy();
    this.scene.start('Menu');
  }
}
