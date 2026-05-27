import SoundManager from '../utils/SoundManager.js';

const WORLD_H = 2800;
const NOAH_SPEED = 220;
const JUMP_FORCE = -560;
const ARK_Y = 100;

const LEVELS = [
  { platCount: 24, minW: 88, maxW: 110, movingCount: 0,  crumbleCount: 0, gapMin: 100, gapMax: 130 },
  { platCount: 21, minW: 74, maxW: 100, movingCount: 4,  crumbleCount: 0, gapMin: 110, gapMax: 145 },
  { platCount: 19, minW: 62, maxW: 90,  movingCount: 6,  crumbleCount: 3, gapMin: 120, gapMax: 158 },
  { platCount: 17, minW: 54, maxW: 80,  movingCount: 8,  crumbleCount: 5, gapMin: 132, gapMax: 170 },
  { platCount: 14, minW: 48, maxW: 68,  movingCount: 10, crumbleCount: 7, gapMin: 144, gapMax: 182 },
];

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
  constructor() {
    super('Game');
  }

  init(data) {
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.lives = 3;
    this.sound = new SoundManager();
  }

  create() {
    // Physics world
    this.physics.world.setBounds(0, 0, 390, WORLD_H);
    this.cameras.main.setBounds(0, 0, 390, WORLD_H);
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Colored zone backgrounds (scroll with camera)
    this.add.rectangle(195, 2600, 390, 600, 0x5cb85c, 0.18);
    this.add.rectangle(195, 1400, 390, 1200, 0x1a6bb5, 0.12);
    this.add.rectangle(195, 400, 390, 800, 0xaaccff, 0.15);

    // Cloud decorations scattered through world
    this._addClouds();

    // Ark near top
    this.add.image(195, ARK_Y, 'ark').setScale(1.6).setDepth(3);

    // Platform groups
    this.staticPlatGroup  = this.physics.add.staticGroup();
    this.movingPlatGroup  = this.physics.add.group();
    this.crumblePlatGroup = this.physics.add.staticGroup();

    this._generatePlatforms();

    // Noah
    this.noah = this.physics.add.sprite(195, WORLD_H - 120, 'noah').setDepth(5);
    this.noah.setGravityY(680);
    this.noah.setCollideWorldBounds(true);

    // Colliders
    this.physics.add.collider(this.noah, this.staticPlatGroup);
    this.physics.add.collider(this.noah, this.movingPlatGroup);
    this.physics.add.collider(this.noah, this.crumblePlatGroup, this._onCrumbleCollide, null, this);

    // Camera manual control
    this.camMinScrollY = WORLD_H - 844;

    // Rain
    this._rainDelay = Math.max(60, 120 - this.level * 12);
    this.rainGroup = this.add.group();
    this.time.addEvent({
      delay: this._rainDelay,
      callback: this._spawnRain,
      callbackScope: this,
      loop: true,
    });

    // Touch / keyboard controls
    this._setupControls();

    // Launch UI
    this.scene.launch('UI', { gameScene: this });

    // Emit initial state
    this.events.emit('levelUpdate', this.level);
    this.events.emit('livesUpdate', this.lives);
    this.events.emit('heightUpdate', 0);

    // Track active moving platforms data
    // (stored in _movingPlats array set during generation)
  }

  // ------------------------------------------------------------------
  _addClouds() {
    const cloudPositions = [
      [60, 2650], [300, 2500], [130, 2300], [280, 2100],
      [70, 1900],  [330, 1750], [150, 1550], [260, 1350],
      [90, 1150],  [310, 980],  [60, 780],   [280, 620],
      [160, 420],  [330, 280],  [80, 180],   [240, 2700],
      [180, 1700], [50, 1100],
    ];
    cloudPositions.forEach(([cx, cy]) => {
      const r = Phaser.Math.Between(18, 34);
      this.add.circle(cx,      cy,     r,      0xffffff, 0.7);
      this.add.circle(cx + 28, cy - 8, r * 0.75, 0xffffff, 0.65);
      this.add.circle(cx + 52, cy,     r * 0.85, 0xffffff, 0.7);
    });
  }

  // ------------------------------------------------------------------
  _generatePlatforms() {
    const ld = getLevelData(this.level);
    const texKey = this.level >= 3 ? 'iceplatform' : 'platform';

    // Collect platform data
    const platData = [];

    // 1. Start platform
    platData.push({ x: 195, y: WORLD_H - 60, w: 200, type: 'static' });

    // 2. Generate intermediate platforms bottom-to-top
    let prevX = 195;
    let prevY = WORLD_H - 60;

    for (let i = 0; i < ld.platCount; i++) {
      const gap = Phaser.Math.Between(ld.gapMin, ld.gapMax);
      const y = prevY - gap;
      if (y < ARK_Y + 120) break;
      const x = Phaser.Math.Clamp(prevX + Phaser.Math.Between(-150, 150), 40, 350);
      const w = Phaser.Math.Between(ld.minW, ld.maxW);
      platData.push({ x, y, w, type: 'static' });
      prevX = x;
      prevY = y;
    }

    // 3. End platform under Ark
    platData.push({ x: 195, y: ARK_Y + 80, w: 160, type: 'static' });

    // 4. Assign moving / crumble types (not first or last)
    const eligibleIndices = [];
    for (let i = 1; i < platData.length - 1; i++) eligibleIndices.push(i);

    // Shuffle helper
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const shuffled = shuffle([...eligibleIndices]);
    const movingIndices = new Set(shuffled.slice(0, ld.movingCount));
    const remaining = shuffled.slice(ld.movingCount);
    const crumbleIndices = new Set(remaining.slice(0, ld.crumbleCount));

    platData.forEach((p, idx) => {
      if (movingIndices.has(idx)) p.type = 'moving';
      else if (crumbleIndices.has(idx)) p.type = 'crumble';
    });

    // 5. Build actual Phaser objects
    this._movingPlats = [];

    platData.forEach((p) => {
      if (p.type === 'static') {
        const img = this.staticPlatGroup.create(p.x, p.y, texKey);
        img.setDisplaySize(p.w, 18).refreshBody();
      } else if (p.type === 'crumble') {
        const img = this.crumblePlatGroup.create(p.x, p.y, texKey);
        img.setDisplaySize(p.w, 18).refreshBody();
        img.crumbleState = 'normal';
      } else if (p.type === 'moving') {
        const img = this.physics.add.image(p.x, p.y, texKey)
          .setDisplaySize(p.w, 18);
        img.setImmovable(true);
        img.setAllowGravity(false);
        const speed = Phaser.Math.Between(60, 110) * (Math.random() < 0.5 ? 1 : -1);
        img.setVelocityX(speed);
        img.minX = p.x - 90;
        img.maxX = p.x + 90;
        img.startX = p.x;
        this.movingPlatGroup.add(img);
        this._movingPlats.push(img);
      }
    });
  }

  // ------------------------------------------------------------------
  _onCrumbleCollide(noah, plat) {
    if (!noah.body.blocked.down) return;
    if (plat.crumbleState !== 'normal') return;
    plat.crumbleState = 'crumbling';

    this.tweens.add({
      targets: plat,
      alpha: 0.2,
      x: plat.x + 3,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        plat.setVisible(false);
        plat.body.enable = false;
      },
    });
  }

  // ------------------------------------------------------------------
  _spawnRain() {
    const scrollY = this.cameras.main.scrollY;
    const x = Phaser.Math.Between(0, 390);
    const drop = this.add.image(x, scrollY - 10, 'raindrop').setDepth(1).setAlpha(0.6);
    this.rainGroup.add(drop);
  }

  // ------------------------------------------------------------------
  _setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftHeld  = false;
    this.rightHeld = false;
    this.jumpHeld  = false;

    // Fixed-position touch zones (in screen space, added to camera-fixed layer)
    // Use setScrollFactor(0) so they stay on screen regardless of camera
    const zonePad = 150; // height of touch area
    const screenH = 844;
    const screenW = 390;

    const leftZone = this.add.rectangle(0, screenH - zonePad, screenW * 0.3, zonePad, 0xffffff, 0.08)
      .setOrigin(0, 0).setDepth(30).setScrollFactor(0).setInteractive();
    const rightZone = this.add.rectangle(screenW * 0.3, screenH - zonePad, screenW * 0.4, zonePad, 0xffffff, 0.08)
      .setOrigin(0, 0).setDepth(30).setScrollFactor(0).setInteractive();
    const jumpZone = this.add.rectangle(screenW * 0.7, screenH - zonePad, screenW * 0.3, zonePad, 0xffffff, 0.08)
      .setOrigin(0, 0).setDepth(30).setScrollFactor(0).setInteractive();

    this.add.text(screenW * 0.15, screenH - 60, '◀', {
      fontSize: '36px', fill: 'rgba(255,255,255,0.6)', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(31).setScrollFactor(0);
    this.add.text(screenW * 0.5, screenH - 60, '▶', {
      fontSize: '36px', fill: 'rgba(255,255,255,0.6)', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(31).setScrollFactor(0);
    this.add.text(screenW * 0.85, screenH - 60, '▲', {
      fontSize: '36px', fill: 'rgba(255,255,255,0.6)', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(31).setScrollFactor(0);

    leftZone.on('pointerdown',  () => { this.leftHeld = true; });
    leftZone.on('pointerup',    () => { this.leftHeld = false; });
    leftZone.on('pointerout',   () => { this.leftHeld = false; });

    rightZone.on('pointerdown', () => { this.rightHeld = true; });
    rightZone.on('pointerup',   () => { this.rightHeld = false; });
    rightZone.on('pointerout',  () => { this.rightHeld = false; });

    jumpZone.on('pointerdown',  () => { this.jumpHeld = true; });
    jumpZone.on('pointerup',    () => { this.jumpHeld = false; });
    jumpZone.on('pointerout',   () => { this.jumpHeld = false; });
  }

  // ------------------------------------------------------------------
  handleDeath() {
    if (this._dying) return;
    this._dying = true;

    this.lives--;
    this.events.emit('livesUpdate', this.lives);
    this.cameras.main.shake(300, 0.012);

    if (this.lives <= 0) {
      this.time.delayedCall(600, () => {
        this.scene.stop('UI');
        this.scene.start('Menu');
      });
    } else {
      this.time.delayedCall(500, () => {
        this._dying = false;
        // Respawn Noah at bottom
        this.noah.setPosition(195, WORLD_H - 120);
        this.noah.setVelocity(0, 0);
        this.camMinScrollY = WORLD_H - 844;
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

  // ------------------------------------------------------------------
  update(time, delta) {
    const noah = this.noah;
    const dt = delta / 1000;

    // Movement
    noah.setVelocityX(0);
    if (this.cursors.left.isDown  || this.leftHeld)  {
      noah.setVelocityX(-NOAH_SPEED);
      noah.setFlipX(true);
    } else if (this.cursors.right.isDown || this.rightHeld) {
      noah.setVelocityX(NOAH_SPEED);
      noah.setFlipX(false);
    }

    // Jump
    if ((this.cursors.up.isDown || this.jumpHeld) && noah.body.blocked.down) {
      noah.setVelocityY(JUMP_FORCE);
      this.jumpHeld = false;
    }

    // Moving platform carry
    if (noah.body.blocked.down) {
      this._movingPlats.forEach((plat) => {
        if (!plat.active) return;
        const halfW = plat.displayWidth / 2;
        const halfH = plat.displayHeight / 2;
        const noahBottom = noah.y + noah.displayHeight / 2;
        const platTop = plat.y - halfH;
        if (
          Math.abs(noahBottom - platTop) < 12 &&
          noah.x >= plat.x - halfW - 4 &&
          noah.x <= plat.x + halfW + 4
        ) {
          noah.x += plat.body.velocity.x * dt;
        }
      });
    }

    // Update moving platforms
    this._movingPlats.forEach((plat) => {
      if (!plat.active) return;
      if (plat.x <= plat.minX && plat.body.velocity.x < 0) {
        plat.setVelocityX(Math.abs(plat.body.velocity.x));
      } else if (plat.x >= plat.maxX && plat.body.velocity.x > 0) {
        plat.setVelocityX(-Math.abs(plat.body.velocity.x));
      }
      plat.body.reset(plat.x, plat.y);
    });

    // Camera manual control — only scroll up (never down)
    const targetY = noah.y - 560;
    if (targetY < this.camMinScrollY) {
      this.camMinScrollY = targetY;
    }
    this.cameras.main.scrollY += (this.camMinScrollY - this.cameras.main.scrollY) * 0.06;
    this.cameras.main.scrollY = Phaser.Math.Clamp(
      this.cameras.main.scrollY, 0, WORLD_H - 844
    );

    // Rain update
    this.rainGroup.getChildren().forEach((drop) => {
      drop.y += 7;
      if (drop.y > this.cameras.main.scrollY + 844 + 30) drop.destroy();
    });

    // Death check — fell below camera view
    if (noah.y > this.cameras.main.scrollY + 844 + 80) {
      this.handleDeath();
    }

    // Win check — reached the Ark
    if (noah.y < ARK_Y + 120) {
      this.handleWin();
    }

    // Height progress (0 at bottom, 1 at top)
    const progress = Phaser.Math.Clamp(
      (WORLD_H - noah.y) / (WORLD_H - ARK_Y), 0, 1
    );
    this.events.emit('heightUpdate', progress);
  }
}
