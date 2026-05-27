import SoundManager from '../utils/SoundManager.js';

const ANIMAL_TYPES = ['elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear'];
const PAIRS_NEEDED = 8; // collect all 8 pairs to win
const NOAH_SPEED = 200;
const ARK_X = 195;
const ARK_Y = 160;
const GROUND_Y = 680;
const DELIVER_RADIUS = 90;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    this.score = 0;
    this.pairsDelivered = 0;
    this.carrying = null;    // animal key being carried
    this.carryCount = 0;     // how many of that type collected (0, 1, or 2)
    this.spawnedAnimals = [];
    this.sound = new SoundManager();
  }

  create() {
    const { width, height } = this.cameras.main;

    // ---- Background ----
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);
    this.add.image(width / 2, ARK_Y + 20, 'water').setDisplaySize(width, 120);

    // ---- Ark ----
    this.arkSprite = this.add.image(ARK_X, ARK_Y, 'ark').setScale(1.8).setDepth(2);
    this.tweens.add({
      targets: this.arkSprite,
      y: ARK_Y + 6,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Delivery zone (invisible trigger area)
    this.deliverZone = this.add.circle(ARK_X, ARK_Y + 30, DELIVER_RADIUS, 0xffff00, 0)
      .setDepth(0);

    // ---- Physics world ----
    this.physics.world.setBounds(0, 0, width, height);

    // Ground platform
    const ground = this.physics.add.staticGroup();
    ground.add(this.add.rectangle(width / 2, height - 10, width, 20, 0x000000, 0));

    // ---- Noah ----
    this.noah = this.physics.add.sprite(width / 2, GROUND_Y, 'noah').setDepth(5);
    this.noah.setCollideWorldBounds(true);
    this.noah.setGravityY(300);
    this.physics.add.collider(this.noah, ground);

    // ---- Animals on the ground ----
    this.animalGroup = this.physics.add.group();
    this.spawnAnimals();

    this.physics.add.collider(this.animalGroup, ground);
    this.physics.add.overlap(this.noah, this.animalGroup, this.onCollectAnimal, null, this);

    // ---- Rain particles ----
    this.rainGroup = this.add.group();
    this.time.addEvent({ delay: 120, callback: this.spawnRain, callbackScope: this, loop: true });

    // ---- Carry indicator above Noah ----
    this.carryText = this.add.text(0, 0, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#fffde7',
      stroke: '#333',
      strokeThickness: 3,
    }).setDepth(10).setOrigin(0.5);

    // ---- Touch / keyboard controls ----
    this.setupControls();

    // ---- Notify UI ----
    this.scene.launch('UI', { gameScene: this });

    // ---- Re-spawn timer ----
    this.time.addEvent({ delay: 8000, callback: this.respawnMissing, callbackScope: this, loop: true });
  }

  // ------------------------------------------------------------------
  spawnAnimals() {
    const { width } = this.cameras.main;
    ANIMAL_TYPES.forEach((type, i) => {
      // Two of each (a pair) at staggered positions
      [0, 1].forEach((j) => {
        const x = 40 + ((i * 2 + j) % 9) * 36 + Phaser.Math.Between(-10, 10);
        const y = GROUND_Y - 60;
        const sprite = this.animalGroup.create(x, y, type);
        sprite.setScale(0.9).setDepth(4);
        sprite.animalType = type;
        sprite.setGravityY(200);
        sprite.setCollideWorldBounds(true);
        // Gentle idle bob
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 8,
          duration: 800 + Phaser.Math.Between(0, 400),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.spawnedAnimals.push(sprite);
      });
    });
  }

  respawnMissing() {
    const { width } = this.cameras.main;
    // If total remaining < needed pairs * 2, spawn replacements
    const alive = this.animalGroup.getChildren().length;
    const pairsLeft = PAIRS_NEEDED - this.pairsDelivered;
    if (alive < pairsLeft * 2) {
      const needed = Math.min(2, pairsLeft * 2 - alive);
      const remaining = ANIMAL_TYPES.filter((t) => {
        const count = this.animalGroup.getChildren().filter((c) => c.animalType === t).length;
        return count < 2;
      });
      remaining.slice(0, needed).forEach((type) => {
        const x = Phaser.Math.Between(30, this.cameras.main.width - 30);
        const sprite = this.animalGroup.create(x, GROUND_Y - 80, type);
        sprite.setScale(0.9).setDepth(4);
        sprite.animalType = type;
        sprite.setGravityY(200);
        sprite.setCollideWorldBounds(true);
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 8,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      });
    }
  }

  // ------------------------------------------------------------------
  onCollectAnimal(noah, animal) {
    if (animal.collected) return;

    const type = animal.animalType;

    if (!this.carrying) {
      // Pick up first of a pair
      this.carrying = type;
      this.carryCount = 1;
      animal.collected = true;
      this.showFloatText(animal.x, animal.y, `${type}!`, '#ffe066');
      animal.destroy();
      this.sound.collect();
      this.updateCarryHUD();
      return;
    }

    if (this.carrying === type && this.carryCount === 1) {
      // Got matching second — pair complete!
      this.carryCount = 2;
      animal.collected = true;
      animal.destroy();
      this.sound.pairMatched();
      this.showFloatText(noah.x, noah.y - 40, 'PAIR! 🎉', '#ff8c00');
      this.updateCarryHUD();
      // Pulse Noah
      this.tweens.add({ targets: noah, scaleX: 1.25, scaleY: 1.25, duration: 150, yoyo: true });
    } else if (this.carrying !== type) {
      // Wrong animal — flash red, drop current carry
      this.sound.wrong();
      this.showFloatText(noah.x, noah.y - 40, 'Find a pair!', '#ff4444');
      this.cameras.main.shake(200, 0.006);
      // Drop current carry: respawn it
      this.respawnAnimal(this.carrying);
      this.carrying = type;
      this.carryCount = 1;
      animal.collected = true;
      animal.destroy();
      this.updateCarryHUD();
    }
  }

  respawnAnimal(type) {
    const x = Phaser.Math.Between(40, this.cameras.main.width - 40);
    const sprite = this.animalGroup.create(x, GROUND_Y - 80, type);
    sprite.setScale(0.9).setDepth(4);
    sprite.animalType = type;
    sprite.setGravityY(200);
    sprite.setCollideWorldBounds(true);
    this.tweens.add({
      targets: sprite,
      y: sprite.y - 8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  updateCarryHUD() {
    if (!this.carrying) {
      this.carryText.setText('');
      return;
    }
    const emoji = this.carryCount === 2 ? '✔✔' : '✔';
    this.carryText.setText(`${this.carrying} ${emoji}`);
  }

  // ------------------------------------------------------------------
  update() {
    const { left, right, up } = this.cursors;
    const noah = this.noah;

    // Reset horizontal
    noah.setVelocityX(0);

    if (left.isDown || this.leftHeld) {
      noah.setVelocityX(-NOAH_SPEED);
      noah.setFlipX(true);
    } else if (right.isDown || this.rightHeld) {
      noah.setVelocityX(NOAH_SPEED);
      noah.setFlipX(false);
    }

    if ((up.isDown || this.jumpHeld) && noah.body.blocked.down) {
      noah.setVelocityY(-420);
      this.jumpHeld = false;
    }

    // Update carry label position
    this.carryText.setPosition(noah.x, noah.y - 48);

    // Check ark delivery
    if (this.carryCount === 2) {
      const dist = Phaser.Math.Distance.Between(noah.x, noah.y, ARK_X, ARK_Y + 30);
      if (dist < DELIVER_RADIUS) {
        this.deliverPair();
      }
    }

    // Update rain
    this.rainGroup.getChildren().forEach((drop) => {
      drop.y += 6;
      if (drop.y > this.cameras.main.height + 20) drop.destroy();
    });
  }

  deliverPair() {
    this.score += 100;
    this.pairsDelivered += 1;
    const type = this.carrying;
    this.carrying = null;
    this.carryCount = 0;
    this.updateCarryHUD();
    this.sound.deliver();

    // Flash ark
    this.tweens.add({ targets: this.arkSprite, alpha: 0.3, duration: 100, yoyo: true, repeat: 3 });
    this.showFloatText(ARK_X, ARK_Y - 60, '+100 🚢', '#ffe066');

    // Emit event to UI
    this.events.emit('scoreUpdate', this.score);
    this.events.emit('pairsUpdate', this.pairsDelivered);

    if (this.pairsDelivered >= PAIRS_NEEDED) {
      this.time.delayedCall(600, () => {
        this.sound.win();
        this.scene.stop('UI');
        this.scene.start('Win', { score: this.score });
      });
    }
  }

  // ------------------------------------------------------------------
  spawnRain() {
    const x = Phaser.Math.Between(0, this.cameras.main.width);
    const drop = this.add.image(x, -10, 'raindrop').setDepth(1).setAlpha(0.6);
    this.rainGroup.add(drop);
  }

  showFloatText(x, y, message, color = '#ffffff') {
    const txt = this.add.text(x, y, message, {
      fontSize: '22px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: color,
      stroke: '#222',
      strokeThickness: 3,
    }).setDepth(20).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  // ------------------------------------------------------------------
  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftHeld = false;
    this.rightHeld = false;
    this.jumpHeld = false;

    const { width, height } = this.cameras.main;

    // Touch zones
    const leftZone = this.add.rectangle(0, height, width * 0.3, 180, 0xffffff, 0.08)
      .setOrigin(0, 1).setDepth(30).setInteractive();
    const rightZone = this.add.rectangle(width * 0.3, height, width * 0.4, 180, 0xffffff, 0.08)
      .setOrigin(0, 1).setDepth(30).setInteractive();
    const jumpZone = this.add.rectangle(width, height, width * 0.3, 180, 0xffffff, 0.08)
      .setOrigin(1, 1).setDepth(30).setInteractive();

    // Labels
    this.add.text(leftZone.x + leftZone.width / 2, height - 50, '◀', {
      fontSize: '36px', fill: 'rgba(255,255,255,0.6)', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(31);
    this.add.text(rightZone.x + rightZone.width / 2, height - 50, '▶', {
      fontSize: '36px', fill: 'rgba(255,255,255,0.6)', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(31);
    this.add.text(width - jumpZone.width / 2, height - 50, '▲', {
      fontSize: '36px', fill: 'rgba(255,255,255,0.6)', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(31);

    leftZone.on('pointerdown', () => { this.leftHeld = true; });
    leftZone.on('pointerup', () => { this.leftHeld = false; });
    leftZone.on('pointerout', () => { this.leftHeld = false; });

    rightZone.on('pointerdown', () => { this.rightHeld = true; });
    rightZone.on('pointerup', () => { this.rightHeld = false; });
    rightZone.on('pointerout', () => { this.rightHeld = false; });

    jumpZone.on('pointerdown', () => { this.jumpHeld = true; });
    jumpZone.on('pointerup', () => { this.jumpHeld = false; });
    jumpZone.on('pointerout', () => { this.jumpHeld = false; });
  }
}
