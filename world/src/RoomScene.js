import { LOCATIONS, ITEMS, drawRoom, buildCharacter } from './Draw.js';
import { loadState, saveState } from './Store.js';
import { Sound } from './Sound.js';

const DRAWER_H = 96;

// The sandbox. Walk the character by tapping the floor, drag items in from the
// drawer, rearrange or trash them. Everything autosaves — no win, no lose.
export default class RoomScene extends Phaser.Scene {
  constructor() {
    super('Room');
  }

  init(data) {
    this.locationKey = data.location || 'house';
  }

  create() {
    const { width, height } = this.scale;
    this.state = loadState();
    this.loc = LOCATIONS.find((l) => l.key === this.locationKey) || LOCATIONS[0];

    // Backdrop
    const roomG = this.add.graphics();
    this.floorY = drawRoom(roomG, this.loc, width, height);
    this.playMaxY = height - DRAWER_H - 10;

    // Restore placed items
    this.placed = [];
    const saved = this.state.rooms[this.locationKey] || [];
    saved.forEach((it) => this.spawnItem(it.type, it.x, it.y, false));

    // Character
    this.hero = buildCharacter(this, this.state.character);
    this.hero.container.setPosition(width / 2, this.floorY + 40).setScale(0.9);
    this.heroBob(this.hero.container);

    // Tap floor to walk
    this.input.on('pointerdown', (pointer, currentlyOver) => {
      if (currentlyOver.length > 0) return; // tapped an item/button
      if (pointer.y > this.playMaxY) return; // in the drawer area
      this.walkHeroTo(pointer.x);
    });

    // Item dragging
    this.input.on('drag', (pointer, obj, dragX, dragY) => {
      obj.x = Phaser.Math.Clamp(dragX, 20, width - 20);
      obj.y = Phaser.Math.Clamp(dragY, 70, this.playMaxY);
      this.trashHot(pointer);
    });
    this.input.on('dragend', (pointer, obj) => {
      if (this.overTrash(pointer)) {
        this.removeItem(obj);
      } else {
        this.depthSort();
        this.persist();
      }
      this.trashCold();
    });

    this.buildTopBar(width);
    this.buildDrawer(width, height);
    this.buildTrash(width, height);
  }

  // ---- Character movement ----
  walkHeroTo(x) {
    const c = this.hero.container;
    const tx = Phaser.Math.Clamp(x, 30, this.scale.width - 30);
    Sound.step();
    this.hero.face(tx < c.x ? -1 : 1);
    const dist = Math.abs(tx - c.x);
    this.tweens.killTweensOf(c);
    this.tweens.add({
      targets: c, x: tx, duration: Math.max(200, dist * 4), ease: 'Sine.inOut',
      onComplete: () => this.heroBob(c),
    });
  }

  heroBob(c) {
    this.tweens.add({
      targets: c, scaleY: 0.88, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
  }

  // ---- Items ----
  spawnItem(type, x, y, save = true) {
    const def = ITEMS.find((i) => i.key === type);
    if (!def) return;
    const spr = this.add.image(x, y, type).setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(spr);
    spr.itemType = type;
    spr.on('pointerdown', () => this.children.bringToTop(spr));
    this.placed.push(spr);
    this.depthSort();
    if (save) { this.persist(); Sound.place(); }
    // little pop-in
    spr.setScale(0);
    this.tweens.add({ targets: spr, scale: 1, duration: 220, ease: 'Back.out' });
    return spr;
  }

  removeItem(spr) {
    Sound.trash();
    this.placed = this.placed.filter((s) => s !== spr);
    this.tweens.add({
      targets: spr, scale: 0, alpha: 0, duration: 180,
      onComplete: () => spr.destroy(),
    });
    this.persist();
  }

  depthSort() {
    // Items lower on screen render in front for a pseudo-3D feel.
    this.placed.forEach((s) => s.setDepth(s.y));
    this.hero.container.setDepth(this.hero.container.y + 200);
  }

  persist() {
    this.state.rooms[this.locationKey] = this.placed.map((s) => ({
      type: s.itemType, x: Math.round(s.x), y: Math.round(s.y),
    }));
    saveState(this.state);
  }

  // ---- UI ----
  buildTopBar(width) {
    // Back to world
    this.iconButton(34, 34, '🌍', () => this.scene.start('World'));
    // Wardrobe
    this.iconButton(width - 34, 34, '👕', () => {
      this.scene.start('Wardrobe', { from: 'Room', location: this.locationKey });
    });
    // Location name
    this.add.text(width / 2, 30, this.loc.name, {
      fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '22px',
      color: '#ffffff', stroke: '#00000055', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(10000);
  }

  iconButton(x, y, emoji, onClick) {
    const c = this.add.container(x, y).setDepth(10000);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.92);
    g.fillCircle(0, 0, 24);
    g.lineStyle(3, 0x1a6bb5, 1);
    g.strokeCircle(0, 0, 24);
    const t = this.add.text(0, 0, emoji, { fontSize: '22px' }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(48, 48).setInteractive(new Phaser.Geom.Circle(0, 0, 26), Phaser.Geom.Circle.Contains);
    c.on('pointerover', () => c.setScale(1.1));
    c.on('pointerout', () => c.setScale(1));
    c.on('pointerdown', () => { Sound.tap(); onClick(); });
    return c;
  }

  buildDrawer(width, height) {
    const y = height - DRAWER_H;
    const bar = this.add.graphics().setDepth(9000);
    bar.fillStyle(0xffffff, 0.95);
    bar.fillRoundedRect(8, y, width - 16, DRAWER_H - 8, 16);
    bar.lineStyle(3, this.loc.accent, 1);
    bar.strokeRoundedRect(8, y, width - 16, DRAWER_H - 8, 16);

    const items = ITEMS.filter((i) => i.room === this.locationKey);
    const slotW = (width - 32) / items.length;
    items.forEach((def, i) => {
      const cx = 24 + slotW * i + slotW / 2;
      const cy = y + (DRAWER_H - 8) / 2;
      const icon = this.add.image(cx, cy - 6, def.key).setDepth(9001);
      const scale = Math.min(1, 56 / Math.max(def.w, def.h));
      icon.setScale(scale).setInteractive({ useHandCursor: true });
      this.add.text(cx, cy + 26, def.label, {
        fontFamily: 'Arial Rounded MT Bold, Arial', fontSize: '12px', color: '#1a6bb5',
      }).setOrigin(0.5).setDepth(9001);
      icon.on('pointerdown', () => {
        this.spawnItem(def.key, width / 2, this.floorY + 10);
      });
      icon.on('pointerover', () => icon.setScale(scale * 1.12));
      icon.on('pointerout', () => icon.setScale(scale));
    });
  }

  buildTrash(width, height) {
    this.trash = this.add.container(width - 40, height - DRAWER_H - 36).setDepth(9500);
    const g = this.add.graphics();
    g.fillStyle(0xff5252, 0.92);
    g.fillCircle(0, 0, 24);
    g.lineStyle(3, 0xffffff, 1);
    g.strokeCircle(0, 0, 24);
    const t = this.add.text(0, 0, '🗑️', { fontSize: '22px' }).setOrigin(0.5);
    this.trash.add([g, t]);
    this.trash.setAlpha(0.55);
    this.trashG = g;
  }

  overTrash(pointer) {
    if (!this.trash) return false;
    return Phaser.Math.Distance.Between(pointer.x, pointer.y, this.trash.x, this.trash.y) < 36;
  }

  trashHot(pointer) {
    this.trash.setAlpha(this.overTrash(pointer) ? 1 : 0.75);
    this.trash.setScale(this.overTrash(pointer) ? 1.25 : 1);
  }

  trashCold() {
    this.trash.setAlpha(0.55).setScale(1);
  }
}
