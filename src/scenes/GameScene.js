import SoundManager from '../utils/SoundManager.js';

const WORLD_H    = 2800;
const NOAH_SPEED = 220;
const JUMP_FORCE = -560;
const ARK_Y      = 100;

// Max safe horizontal offset between consecutive platforms.
// With gravity=680 and jump=-560, max height=230px.
// At height 182px (worst-case gap) Noah has 200px horizontal reach — safe at ±100.
const MAX_HORIZ = 100;

const LEVELS = [
  { platCount: 24, minW: 88, maxW: 110, movingCount: 0,  crumbleCount: 0, gapMin: 100, gapMax: 130 },
  { platCount: 21, minW: 74, maxW: 100, movingCount: 4,  crumbleCount: 0, gapMin: 110, gapMax: 145 },
  { platCount: 19, minW: 62, maxW: 90,  movingCount: 6,  crumbleCount: 3, gapMin: 120, gapMax: 158 },
  { platCount: 17, minW: 54, maxW: 80,  movingCount: 8,  crumbleCount: 5, gapMin: 132, gapMax: 170 },
  { platCount: 14, minW: 48, maxW: 68,  movingCount: 10, crumbleCount: 7, gapMin: 144, gapMax: 182 },
];

const ANIMALS = ['elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear'];

function getLevelData(level) {
  if (level <= 5) return LEVELS[level - 1];
  const base = Object.assign({}, LEVELS[4]);
  const extra = level - 5;
  base.movingCount = LEVELS[4].movingCount + extra;
  base.gapMin = LEVELS[4].gapMin + extra * 8;
  base.gapMax = LEVELS[4].gapMax + extra * 8;
  return base;
}

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.lives = 3;
    this.sound = new SoundManager();
  }

  create() {
    try {
      this._createGame();
    } catch (e) {
      this.cameras.main.setBackgroundColor('#000033');
      this.add.rectangle(195, 300, 370, 400, 0x220000, 0.95)
        .setScrollFactor(0).setDepth(100);
      const msg = 'GAME ERROR:\n' + e.message + '\n\n' + (e.stack || '').slice(0, 300);
      this.add.text(195, 300, msg, {
        fontSize: '13px', fill: '#ff6666', fontFamily: 'monospace',
        wordWrap: { width: 350 }, align: 'left',
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);
      console.error('GameScene crash:', e);
    }
  }

  _createGame() {
    this.physics.world.setBounds(0, 0, 390, WORLD_H);
    this.cameras.main.setBounds(0, 0, 390, WORLD_H);
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Altitude zone tints
    this.add.rectangle(195, 2600, 390, 600, 0x5cb85c, 0.18);
    this.add.rectangle(195, 1400, 390, 1200, 0x1a6bb5, 0.12);
    this.add.rectangle(195, 400,  390, 800,  0xaaccff, 0.15);

    this._addClouds();

    // Ark near top
    this.add.image(195, ARK_Y, 'ark').setScale(1.6).setDepth(3);

    // Platform groups
    this.staticPlatGroup  = this.physics.add.staticGroup();
    this.movingPlatGroup  = this.physics.add.group();
    this.crumblePlatGroup = this.physics.add.staticGroup();

    this._generatePlatforms();
    this._spawnAnimals();

    // Rising water — starts below the world, creeps upward
    this._waterLevel  = WORLD_H + 120;
    this._waterSpeed  = 20 + this.level * 10; // px/s; lvl1=30, lvl5=70
    const waterBlockH = 2400;
    this._waterGfx    = this.add.rectangle(195, this._waterLevel + waterBlockH / 2, 390, waterBlockH, 0x0d47a1, 0.82).setDepth(6);
    this._waterLine   = this.add.rectangle(195, this._waterLevel, 390, 10, 0x42a5f5, 0.95).setDepth(7);
    // Small wave shimmer on surface
    this._waterShimmer = this.add.rectangle(195, this._waterLevel - 4, 390, 5, 0x90caf9, 0.6).setDepth(7);

    // Noah
    this.noah = this.physics.add.sprite(195, WORLD_H - 120, 'noah').setDepth(5);
    this.noah.setGravityY(680);
    this.noah.setCollideWorldBounds(true);

    // Colliders
    this.physics.add.collider(this.noah, this.staticPlatGroup);
    this.physics.add.collider(this.noah, this.movingPlatGroup);
    this.physics.add.collider(this.noah, this.crumblePlatGroup, this._onCrumbleCollide, null, this);

    // Animal collection
    this.physics.add.overlap(this.noah, this.animalGroup, this._onCollectAnimal, null, this);

    // Camera
    this.camMinScrollY = WORLD_H - 844;

    // Rain density increases per level
    this.rainGroup = this.add.group();
    this.time.addEvent({
      delay: Math.max(55, 120 - this.level * 12),
      callback: this._spawnRain,
      callbackScope: this,
      loop: true,
    });

    this._setupControls();
    this.scene.launch('UI', { gameScene: this });

    this.events.emit('levelUpdate', this.level);
    this.events.emit('livesUpdate', this.lives);
    this.events.emit('scoreUpdate',  this.score);
    this.events.emit('heightUpdate', 0);
    this.events.emit('waterUpdate',  0);
  } // end _createGame

  // ── Clouds ──────────────────────────────────────────────────────────
  _addClouds() {
    const positions = [
      [60,2650],[300,2500],[130,2300],[280,2100],[70,1900],[330,1750],
      [150,1550],[260,1350],[90,1150],[310,980],[60,780],[280,620],
      [160,420],[330,280],[80,180],[240,2700],[180,1700],[50,1100],
    ];
    positions.forEach(([cx, cy]) => {
      const r = Phaser.Math.Between(18, 34);
      this.add.circle(cx,      cy,     r,       0xffffff, 0.7);
      this.add.circle(cx + 28, cy - 8, r * 0.75, 0xffffff, 0.65);
      this.add.circle(cx + 52, cy,     r * 0.85, 0xffffff, 0.7);
    });
  }

  // ── Platform generation ─────────────────────────────────────────────
  _generatePlatforms() {
    const ld     = getLevelData(this.level);
    const texKey = this.level >= 3 ? 'iceplatform' : 'platform';
    const platData = [];

    // Bottom start platform
    platData.push({ x: 195, y: WORLD_H - 60, w: 200, type: 'static' });

    let prevX = 195;
    let prevY = WORLD_H - 60;

    for (let i = 0; i < ld.platCount; i++) {
      const gap = Phaser.Math.Between(ld.gapMin, ld.gapMax);
      const y   = prevY - gap;
      if (y < ARK_Y + 120) break;

      // Clamp horizontal offset to ±MAX_HORIZ so every jump is reachable
      const dx = Phaser.Math.Between(-MAX_HORIZ, MAX_HORIZ);
      const x  = Phaser.Math.Clamp(prevX + dx, 45, 345);
      const w  = Phaser.Math.Between(ld.minW, ld.maxW);

      platData.push({ x, y, w, type: 'static' });
      prevX = x;
      prevY = y;
    }

    // Top platform under Ark
    platData.push({ x: 195, y: ARK_Y + 80, w: 160, type: 'static' });

    // Randomly assign moving / crumble types (skip first & last)
    const eligible = [];
    for (let i = 1; i < platData.length - 1; i++) eligible.push(i);
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const movingSet  = new Set(shuffled.slice(0, ld.movingCount));
    const crumbleSet = new Set(shuffled.slice(ld.movingCount, ld.movingCount + ld.crumbleCount));

    platData.forEach((p, idx) => {
      if (movingSet.has(idx))  p.type = 'moving';
      else if (crumbleSet.has(idx)) p.type = 'crumble';
    });

    this._movingPlats = [];

    platData.forEach((p) => {
      if (p.type === 'static') {
        this.staticPlatGroup.create(p.x, p.y, texKey)
          .setDisplaySize(p.w, 18).refreshBody();

      } else if (p.type === 'crumble') {
        const img = this.crumblePlatGroup.create(p.x, p.y, texKey);
        img.setDisplaySize(p.w, 18).refreshBody();
        // Red tint so player can tell it's crumbling type
        img.setTint(0xff9966);
        img.crumbleState = 'normal';

      } else if (p.type === 'moving') {
        const img = this.physics.add.image(p.x, p.y, texKey)
          .setDisplaySize(p.w, 18);
        img.setImmovable(true);
        img.setAllowGravity(false);
        // Blue tint so player can tell it moves
        img.setTint(0x66ccff);
        const spd = Phaser.Math.Between(55, 105) * (Math.random() < 0.5 ? 1 : -1);
        img.setVelocityX(spd);
        img.minX = Math.max(45,  p.x - 85);
        img.maxX = Math.min(345, p.x + 85);
        this.movingPlatGroup.add(img);
        this._movingPlats.push(img);
      }
    });
  }

  // ── Animals on platforms ────────────────────────────────────────────
  _spawnAnimals() {
    this.animalGroup = this.physics.add.group();

    // Place one animal on every 3rd static platform (skip bottom/top)
    const statics = this.staticPlatGroup.getChildren();
    statics.forEach((plat, i) => {
      if (i === 0 || i === statics.length - 1) return;
      if (i % 3 !== 1) return;
      this._placeAnimalOn(plat.x, plat.y);
    });

    // One animal on every other moving platform
    this._movingPlats.forEach((plat, i) => {
      if (i % 2 !== 0) return;
      this._placeAnimalOn(plat.x, plat.y);
    });
  }

  _placeAnimalOn(px, py) {
    const type   = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const animal = this.animalGroup.create(px, py - 30, type);
    animal.setScale(0.78).setDepth(4);
    animal.setAllowGravity(false);
    animal.body.setImmovable(true);
    this.tweens.add({
      targets: animal,
      y: animal.y - 7,
      duration: 750 + Phaser.Math.Between(0, 300),
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _onCollectAnimal(noah, animal) {
    animal.destroy();
    this.score += 25;
    this.sound.collect();
    this._showFloatText(noah.x, noah.y - 32, '+25 🐾', '#ffe066');
    this.events.emit('scoreUpdate', this.score);
  }

  // ── Crumble logic ────────────────────────────────────────────────────
  _onCrumbleCollide(noah, plat) {
    if (!noah.body.blocked.down) return;
    if (plat.crumbleState !== 'normal') return;
    plat.crumbleState = 'crumbling';
    this.tweens.add({
      targets: plat,
      alpha: 0.25,
      duration: 90,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        plat.setVisible(false);
        plat.body.enable = false;
      },
    });
  }

  // ── Rain ─────────────────────────────────────────────────────────────
  _spawnRain() {
    const x    = Phaser.Math.Between(0, 390);
    const drop = this.add.image(x, this.cameras.main.scrollY - 10, 'raindrop')
      .setDepth(1).setAlpha(0.55);
    this.rainGroup.add(drop);
  }

  // ── Float text ───────────────────────────────────────────────────────
  _showFloatText(x, y, msg, color = '#fff') {
    const t = this.add.text(x, y, msg, {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: color, stroke: '#222', strokeThickness: 3,
    }).setDepth(20).setOrigin(0.5);
    this.tweens.add({
      targets: t, y: y - 55, alpha: 0, duration: 950,
      ease: 'Power2', onComplete: () => t.destroy(),
    });
  }

  // ── Controls ─────────────────────────────────────────────────────────
  _setupControls() {
    this.cursors   = this.input.keyboard.createCursorKeys();
    this.leftHeld  = false;
    this.rightHeld = false;
    this.jumpHeld  = false;

    const screenW = 390;
    const screenH = 844;
    const zoneH   = 160;

    const leftZone  = this.add.rectangle(0,              screenH - zoneH, screenW * 0.3, zoneH, 0xffffff, 0.08)
      .setOrigin(0, 0).setDepth(30).setScrollFactor(0).setInteractive();
    const rightZone = this.add.rectangle(screenW * 0.3,  screenH - zoneH, screenW * 0.4, zoneH, 0xffffff, 0.08)
      .setOrigin(0, 0).setDepth(30).setScrollFactor(0).setInteractive();
    const jumpZone  = this.add.rectangle(screenW * 0.7,  screenH - zoneH, screenW * 0.3, zoneH, 0xffffff, 0.08)
      .setOrigin(0, 0).setDepth(30).setScrollFactor(0).setInteractive();

    [['◀', screenW * 0.15], ['▶', screenW * 0.5], ['▲', screenW * 0.85]].forEach(([label, lx]) => {
      this.add.text(lx, screenH - 55, label, {
        fontSize: '36px', fill: 'rgba(255,255,255,0.55)', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(31).setScrollFactor(0);
    });

    leftZone.on('pointerdown',  () => { this.leftHeld  = true;  });
    leftZone.on('pointerup',    () => { this.leftHeld  = false; });
    leftZone.on('pointerout',   () => { this.leftHeld  = false; });
    rightZone.on('pointerdown', () => { this.rightHeld = true;  });
    rightZone.on('pointerup',   () => { this.rightHeld = false; });
    rightZone.on('pointerout',  () => { this.rightHeld = false; });
    jumpZone.on('pointerdown',  () => { this.jumpHeld  = true;  });
    jumpZone.on('pointerup',    () => { this.jumpHeld  = false; });
    jumpZone.on('pointerout',   () => { this.jumpHeld  = false; });
  }

  // ── Death / Win ───────────────────────────────────────────────────────
  handleDeath() {
    if (this._dying) return;
    this._dying = true;
    this.lives--;
    this.events.emit('livesUpdate', this.lives);
    this.cameras.main.shake(300, 0.012);
    this.sound.wrong();

    if (this.lives <= 0) {
      this.time.delayedCall(700, () => {
        this.scene.stop('UI');
        this.scene.start('Menu');
      });
    } else {
      this.time.delayedCall(500, () => {
        this._dying = false;
        this.noah.setPosition(195, WORLD_H - 120);
        this.noah.setVelocity(0, 0);
        this.camMinScrollY = WORLD_H - 844;
        // Reset water slightly — give player a small grace period
        this._waterLevel  = Math.min(this._waterLevel + 180, WORLD_H + 120);
      });
    }
  }

  handleWin() {
    if (this._won) return;
    this._won = true;
    this.score += 100 + this.lives * 50;
    this.sound.win();
    this.time.delayedCall(400, () => {
      this.scene.stop('UI');
      this.scene.start('Win', { level: this.level, score: this.score });
    });
  }

  // ── Main loop ─────────────────────────────────────────────────────────
  update(time, delta) {
    if (!this.noah || !this._movingPlats) return; // guard: _createGame() failed
    const noah = this.noah;
    const dt   = delta / 1000;

    // Horizontal movement
    noah.setVelocityX(0);
    if (this.cursors.left.isDown  || this.leftHeld)  { noah.setVelocityX(-NOAH_SPEED); noah.setFlipX(true);  }
    else if (this.cursors.right.isDown || this.rightHeld) { noah.setVelocityX(NOAH_SPEED); noah.setFlipX(false); }

    // Jump
    if ((this.cursors.up.isDown || this.jumpHeld) && noah.body.blocked.down) {
      noah.setVelocityY(JUMP_FORCE);
      this.jumpHeld = false;
      this.sound.collect();
    }

    // Carry player on moving platforms
    if (noah.body.blocked.down) {
      this._movingPlats.forEach((plat) => {
        if (!plat.active) return;
        const hw = plat.displayWidth / 2;
        const hh = plat.displayHeight / 2;
        if (
          Math.abs((noah.y + noah.displayHeight / 2) - (plat.y - hh)) < 12 &&
          noah.x >= plat.x - hw - 4 &&
          noah.x <= plat.x + hw + 4
        ) {
          noah.x += plat.body.velocity.x * dt;
        }
      });
    }

    // Move and reverse moving platforms
    this._movingPlats.forEach((plat) => {
      if (!plat.active) return;
      if (plat.x <= plat.minX && plat.body.velocity.x < 0) plat.setVelocityX( Math.abs(plat.body.velocity.x));
      if (plat.x >= plat.maxX && plat.body.velocity.x > 0) plat.setVelocityX(-Math.abs(plat.body.velocity.x));
      plat.body.reset(plat.x, plat.y);
    });

    // Rising water
    this._waterLevel -= this._waterSpeed * dt;
    const waterBlockH = 2400;
    this._waterGfx.setPosition(195, this._waterLevel + waterBlockH / 2);
    this._waterLine.setPosition(195, this._waterLevel);
    this._waterShimmer.setPosition(195, this._waterLevel - 5);

    // Death from water
    if (!this._dying && noah.y + 20 >= this._waterLevel) {
      this.handleDeath();
    }

    // Camera — only scroll upward
    const targetY = noah.y - 560;
    if (targetY < this.camMinScrollY) this.camMinScrollY = targetY;
    this.cameras.main.scrollY += (this.camMinScrollY - this.cameras.main.scrollY) * 0.06;
    this.cameras.main.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY, 0, WORLD_H - 844);

    // Rain cleanup
    this.rainGroup.getChildren().forEach((drop) => {
      drop.y += 7;
      if (drop.y > this.cameras.main.scrollY + 900) drop.destroy();
    });

    // Fall below camera
    if (noah.y > this.cameras.main.scrollY + 844 + 80) this.handleDeath();

    // Win
    if (noah.y < ARK_Y + 120) this.handleWin();

    // UI updates
    const progress = Phaser.Math.Clamp((WORLD_H - noah.y) / (WORLD_H - ARK_Y), 0, 1);
    this.events.emit('heightUpdate', progress);

    const waterDist = this._waterLevel - noah.y;
    const danger    = Phaser.Math.Clamp(1 - waterDist / 280, 0, 1);
    this.events.emit('waterUpdate', danger);
  }
}
