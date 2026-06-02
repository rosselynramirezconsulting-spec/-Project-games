export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.finalScore = data.score || 0;
    this.level      = data.level || 1;
    const prev = parseInt(localStorage.getItem('noahsArkHighScore') || '0', 10);
    this.isNewBest = this.finalScore > prev;
    this.highScore = Math.max(this.finalScore, prev);
    if (this.isNewBest) localStorage.setItem('noahsArkHighScore', this.highScore);
  }

  create() {
    const W = 390, H = 844;

    // Dark stormy sky
    this.add.rectangle(W / 2, H / 2, W, H, 0x08121e);

    // Rain
    this.time.addEvent({
      delay: 55, loop: true,
      callback: () => {
        const x    = Phaser.Math.Between(0, W);
        const drop = this.add.rectangle(x, -12, 2, 14, 0x3a7aaa, 0.65);
        this.tweens.add({
          targets: drop,
          y: H + 20,
          duration: Phaser.Math.Between(550, 950),
          onComplete: () => drop.destroy(),
        });
      },
    });

    // Rising water at bottom
    const waterY = H - 280;
    this.add.rectangle(W / 2, H - 140, W, 280, 0x0a2840);
    this.add.rectangle(W / 2, waterY,      W, 10, 0x1a6090, 0.95);
    this.add.rectangle(W / 2, waterY + 6,  W, 5,  0x3a90c0, 0.5);

    // Wave shimmer
    const shimmer = this.add.rectangle(W / 2, waterY + 3, W, 4, 0x55aadd, 0.45);
    this.tweens.add({ targets: shimmer, x: W / 2 + 18, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Noah floating (blue-tinted = in water)
    const noah = this.add.image(W / 2, waterY + 32, 'noah').setScale(1.5).setTint(0x6699cc);
    this.tweens.add({ targets: noah, y: waterY + 40, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: noah, angle: -14,      duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Broken hearts (all faded)
    [-44, 0, 44].forEach((dx) => {
      this.add.image(W / 2 + dx, H * 0.54, 'heart').setScale(1.4).setTint(0x332222).setAlpha(0.45);
    });

    // GAME OVER title
    this.add.rectangle(W / 2, H * 0.18, W, 88, 0x000000, 0.55);
    const title = this.add.text(W / 2, H * 0.155, 'GAME OVER', {
      fontSize: '50px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#ff3333', stroke: '#660000', strokeThickness: 7,
    }).setOrigin(0.5).setAlpha(0);
    this.add.text(W / 2, H * 0.215, `You reached Level ${this.level}`, {
      fontSize: '17px', fontFamily: 'Arial', fill: '#99bbdd', stroke: '#112233', strokeThickness: 2,
    }).setOrigin(0.5);

    this.tweens.add({ targets: title, alpha: 1, duration: 600, ease: 'Back.easeOut' });

    // Score + high score panel
    this.add.rectangle(W / 2, H * 0.37, 300, 100, 0x000000, 0.5);
    this.add.text(W / 2, H * 0.335, 'Final Score', {
      fontSize: '17px', fontFamily: 'Arial', fill: '#88bbdd',
    }).setOrigin(0.5);
    this.add.text(W / 2, H * 0.375, `${this.finalScore}`, {
      fontSize: '38px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#ffe066', stroke: '#333', strokeThickness: 4,
    }).setOrigin(0.5);

    // Best score row
    this.add.text(W / 2 - 30, H * 0.415, 'BEST:', {
      fontSize: '14px', fontFamily: 'Arial', fill: '#aaddff',
    }).setOrigin(0.5);
    this.add.text(W / 2 + 28, H * 0.415, `${this.highScore}`, {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: this.isNewBest ? '#ffdd00' : '#aaddff', stroke: '#222', strokeThickness: 2,
    }).setOrigin(0.5);

    if (this.isNewBest) {
      const newBest = this.add.text(W / 2 + 80, H * 0.415, 'NEW BEST!', {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#ffdd00',
      }).setOrigin(0.5);
      this.tweens.add({ targets: newBest, scaleX: 1.2, scaleY: 1.2, duration: 400, yoyo: true, repeat: -1 });
    }

    // Try Again button
    const retryBtn = this.add.rectangle(W / 2, H * 0.65, 240, 64, 0xcc4400)
      .setInteractive({ useHandCursor: true });
    const retryHL  = this.add.rectangle(W / 2, H * 0.65 - 10, 228, 22, 0xffffff, 0.14);
    this.add.text(W / 2, H * 0.65, '↺  Try Again', {
      fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#ffffff', stroke: '#661100', strokeThickness: 4,
    }).setOrigin(0.5);
    retryBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: [retryBtn, retryHL], scaleX: 0.93, scaleY: 0.93, duration: 80, yoyo: true,
        onComplete: () => this.scene.start('Game', { level: 1, score: 0 }),
      });
    });
    this.tweens.add({ targets: retryBtn, scaleX: 1.05, scaleY: 1.05, duration: 750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Menu button
    const menuBtn = this.add.rectangle(W / 2, H * 0.76, 180, 46, 0x334466)
      .setInteractive({ useHandCursor: true });
    this.add.text(W / 2, H * 0.76, 'Main Menu', {
      fontSize: '20px', fontFamily: 'Arial', fill: '#aabbcc',
    }).setOrigin(0.5);
    menuBtn.on('pointerdown', () => this.scene.start('Menu'));
  }
}
