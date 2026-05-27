export default class WinScene extends Phaser.Scene {
  constructor() {
    super('Win');
  }

  init(data) {
    this.level = data.level || 1;
    this.finalScore = data.score || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);
    this.add.image(width / 2, height * 0.3, 'ark').setScale(2.5);

    // Rainbow banner
    this.add.rectangle(width / 2, height * 0.12, 380, 80, 0x000000, 0.4);
    this.add.text(width / 2, height * 0.09, `Level ${this.level} Complete! 🎉`, {
      fontSize: '36px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#ffe066',
      stroke: '#7a4200',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.158, 'Noah reached the Ark!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      stroke: '#1a5a90',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Score display
    this.add.rectangle(width / 2, height * 0.52, 300, 70, 0x000000, 0.4);
    this.add.text(width / 2, height * 0.50, 'Score', {
      fontSize: '20px',
      fontFamily: 'Arial',
      fill: '#aaffaa',
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.545, `${this.finalScore}`, {
      fontSize: '36px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#ffe066',
      stroke: '#333',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Animals parade
    const animals = ['elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear'];
    animals.forEach((a, i) => {
      const x = (i % 4) * 90 + 40;
      const y = height * 0.67 + Math.floor(i / 4) * 75;
      const s = this.add.image(x, y, a).setScale(1.3);
      this.tweens.add({
        targets: s,
        y: y - 12,
        duration: 700 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // Star particles
    this.createStars();

    // Next Level button
    const nextBtnBg = this.add.rectangle(width / 2 - 70, height * 0.88, 220, 60, 0xff8c00)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2 - 70, height * 0.88, 'Next Level →', {
      fontSize: '26px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#7a4200',
      strokeThickness: 4,
    }).setOrigin(0.5);

    nextBtnBg.on('pointerdown', () => {
      this.scene.start('Game', { level: this.level + 1, score: this.finalScore });
    });

    this.tweens.add({
      targets: nextBtnBg,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Menu button (secondary)
    const menuBtnBg = this.add.rectangle(width - 55, height * 0.88, 90, 50, 0x555555)
      .setInteractive({ useHandCursor: true });
    this.add.text(width - 55, height * 0.88, 'Menu', {
      fontSize: '20px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#222',
      strokeThickness: 3,
    }).setOrigin(0.5);

    menuBtnBg.on('pointerdown', () => {
      this.scene.start('Menu');
    });
  }

  createStars() {
    const { width, height } = this.cameras.main;
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(10, width - 10);
      const y = Phaser.Math.Between(10, height * 0.6);
      const star = this.add.image(x, y, 'star').setScale(Phaser.Math.FloatBetween(0.6, 1.4)).setAlpha(0);
      this.tweens.add({
        targets: star,
        alpha: 1,
        scaleX: star.scaleX * 1.5,
        scaleY: star.scaleY * 1.5,
        delay: Phaser.Math.Between(0, 1200),
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    }
  }
}
