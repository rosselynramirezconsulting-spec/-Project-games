export default class WinScene extends Phaser.Scene {
  constructor() { super('Win'); }

  init(data) {
    this.level = data.level || 1;
    this.finalScore = data.score || 0;
    this.animalsCollected = data.animalsCollected || 0;
    const prev = parseInt(localStorage.getItem('noahsArkHighScore') || '0', 10);
    this.isNewBest = this.finalScore > prev;
    this.highScore = Math.max(this.finalScore, prev);
    if (this.isNewBest) localStorage.setItem('noahsArkHighScore', this.highScore);
  }

  create() {
    const W = 390, H = 844;
    const waterY = 555; // ocean surface y

    // Sky
    this.add.rectangle(W / 2, waterY / 2, W, waterY, 0x87CEEB);

    // Sun
    this.add.circle(68, 90, 44, 0xffd700, 0.92);
    this.add.circle(68, 90, 34, 0xffee88, 0.7);

    // Rainbow
    this._drawRainbow(W / 2, waterY - 30);

    // Drifting clouds
    this._addClouds();

    // Ocean
    this.add.rectangle(W / 2, waterY + (H - waterY) / 2, W, H - waterY, 0x0d47a1);
    this.add.rectangle(W / 2, waterY,      W, 14, 0x42a5f5, 0.95);
    this.add.rectangle(W / 2, waterY + 10, W, 7,  0x90caf9, 0.55);

    // Wave shimmer repeating
    this.time.addEvent({
      delay: 1800, loop: true,
      callback: () => {
        const shine = this.add.rectangle(
          Phaser.Math.Between(20, W - 20), waterY + Phaser.Math.Between(10, 80),
          Phaser.Math.Between(30, 80), 4, 0x90caf9, 0.4,
        );
        this.tweens.add({ targets: shine, alpha: 0, duration: 900, onComplete: () => shine.destroy() });
      },
    });

    // Ark floating on ocean — hull half-submerged
    const arkY = waterY - 42;
    this.arkObj = this.add.image(W / 2, arkY, 'ark-open').setScale(2.2).setDepth(5);

    // Bob
    this.tweens.add({
      targets: this.arkObj, y: arkY + 9,
      duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    // Gentle rock
    this.tweens.add({
      targets: this.arkObj, angle: 2.5,
      duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Noah peeking from door
    this.noahPeek = this.add.image(W / 2, arkY - 68, 'noah').setScale(0.65).setDepth(6);
    this.tweens.add({
      targets: this.noahPeek, y: arkY - 68 + 7,
      duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Title banner
    this.add.rectangle(W / 2, 58, W, 112, 0x000000, 0.5).setDepth(10);
    this.add.text(W / 2, 24, `Level ${this.level} Complete!`, {
      fontSize: '32px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#ffe066', stroke: '#7a4200', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(11);
    this.add.text(W / 2, 62, `Animals saved: ${this.animalsCollected}   Score: ${this.finalScore}`, {
      fontSize: '15px', fontFamily: 'Arial',
      fill: '#aaffaa', stroke: '#222', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(11);

    // Best score row in banner
    const bestColor = this.isNewBest ? '#ffdd00' : '#aaddff';
    this.add.text(W / 2 - 18, 90, `Best: ${this.highScore}`, {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: bestColor, stroke: '#222', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(11);

    if (this.isNewBest) {
      const nb = this.add.text(W / 2 + 72, 90, 'NEW BEST!', {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#ffdd00',
      }).setOrigin(0.5).setDepth(11);
      this.tweens.add({ targets: nb, scaleX: 1.25, scaleY: 1.25, duration: 380, yoyo: true, repeat: -1 });
    }

    // Animals burst out of the ark after a short delay
    this._spawnAnimalParade(W / 2, arkY - 20, waterY);

    // Confetti
    this._spawnConfetti();

    // Next Level button
    const nextBtn = this.add.rectangle(W / 2, H - 68, 240, 64, 0xff8c00)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    const btnHighlight = this.add.rectangle(W / 2, H - 78, 228, 26, 0xffbb44, 0.4).setDepth(11);
    this.add.text(W / 2, H - 68, 'Next Level →', {
      fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#ffffff', stroke: '#7a4200', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(12);
    nextBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: [nextBtn, btnHighlight], scaleX: 0.95, scaleY: 0.95,
        duration: 80, yoyo: true,
        onComplete: () => this.scene.start('Game', { level: this.level + 1, score: this.finalScore }),
      });
    });
    this.tweens.add({
      targets: nextBtn, scaleX: 1.05, scaleY: 1.05,
      duration: 750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Menu button
    const menuBtn = this.add.rectangle(W / 2, H - 18, 150, 36, 0x444444)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(W / 2, H - 18, 'Main Menu', {
      fontSize: '17px', fontFamily: 'Arial', fill: '#cccccc',
    }).setOrigin(0.5).setDepth(11);
    menuBtn.on('pointerdown', () => this.scene.start('Menu'));
  }

  _drawRainbow(cx, cy) {
    const bands = [0xff2222, 0xff8800, 0xffee00, 0x22cc22, 0x2288ff, 0x8822ff];
    bands.forEach((color, i) => {
      const r = 145 - i * 17;
      const gfx = this.add.graphics().setDepth(2);
      gfx.lineStyle(18, color, 0.45);
      gfx.arc(cx, cy, r, Math.PI, 2 * Math.PI, false);
      gfx.strokePath();
    });
  }

  _addClouds() {
    [[50, 145], [270, 120], [155, 195], [340, 170]].forEach(([x, y]) => {
      const gfx = this.add.graphics().setDepth(3);
      gfx.fillStyle(0xffffff, 0.78);
      gfx.fillCircle(0, 0, 24);
      gfx.fillCircle(28, -8, 18);
      gfx.fillCircle(52, 0, 22);
      gfx.setPosition(x, y);
      this.tweens.add({
        targets: gfx, x: x + 28,
        duration: 7000 + Math.random() * 5000,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });
  }

  _spawnAnimalParade(arkX, arkY, waterY) {
    const ANIMALS = ['elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear'];
    ANIMALS.forEach((a, i) => {
      this.time.delayedCall(500 + i * 320, () => {
        const goLeft = i % 2 === 0;
        const col = Math.floor(i / 2);
        const endX = goLeft ? 28 + col * 88 : 362 - col * 88;
        const endY = waterY + 48 + Math.floor(i / 4) * 58;

        const spr = this.add.image(arkX, arkY, a).setScale(1.2).setDepth(7);
        spr.setFlipX(!goLeft);

        this.tweens.add({
          targets: spr,
          x: endX, y: endY,
          duration: 750,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: spr, y: endY - 10,
              duration: 650 + i * 70,
              yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
          },
        });
      });
    });
  }

  _spawnConfetti() {
    const colors = [0xff4444, 0xffcc00, 0x44ff88, 0x4499ff, 0xff55cc, 0xffffff, 0xff9900];
    const burst = (count) => {
      for (let i = 0; i < count; i++) {
        this.time.delayedCall(i * 90, () => {
          const x = Phaser.Math.Between(10, 380);
          const piece = this.add.rectangle(x, -18, 9, 9, colors[i % colors.length]).setDepth(15);
          this.tweens.add({
            targets: piece,
            y: Phaser.Math.Between(280, 560),
            x: x + Phaser.Math.Between(-70, 70),
            angle: Phaser.Math.Between(200, 560),
            alpha: 0,
            duration: Phaser.Math.Between(1800, 3200),
            onComplete: () => piece.destroy(),
          });
        });
      }
    };

    burst(32);
    this.time.addEvent({ delay: 3200, loop: true, callback: () => burst(14) });
  }
}
