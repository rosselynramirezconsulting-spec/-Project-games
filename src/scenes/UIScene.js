export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UI', active: false });
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Top HUD panel
    this.add.rectangle(width / 2, 28, width, 56, 0x000000, 0.45).setDepth(50);

    // Level label top-left
    this.levelLabel = this.add.text(16, 14, 'Level: 1', {
      fontSize: '22px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#ffe066',
      stroke: '#333',
      strokeThickness: 3,
    }).setDepth(51);

    // Lives row top-right (3 heart images)
    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(width - 20 - i * 32, 28, 'heart')
        .setScale(1.1)
        .setDepth(51);
      this.hearts.push(heart);
    }

    // Height progress bar — thin vertical bar on left edge
    const barX = 6;
    const barTop = 60;
    const barBottom = height - 20;
    const barHeight = barBottom - barTop;

    // Background track
    this.add.rectangle(barX, barTop + barHeight / 2, 8, barHeight, 0x000000, 0.3).setDepth(50).setOrigin(0.5, 0.5);

    // Fill bar (grows upward)
    this.progressBarBg = this.add.rectangle(barX, barBottom, 6, 0, 0x00ff88, 0.8)
      .setDepth(51).setOrigin(0.5, 1);
    this._barHeight = barHeight;
    this._barBottom = barBottom;

    // Instruction banner (fades out)
    const instText = this.add.text(width / 2, 80, 'Jump up to reach the Ark!', {
      fontSize: '15px',
      fontFamily: 'Arial',
      fill: '#fffde7',
      stroke: '#1a5a90',
      strokeThickness: 3,
      wordWrap: { width: 360 },
      align: 'center',
    }).setDepth(51).setOrigin(0.5);

    this.tweens.add({
      targets: instText,
      alpha: 0,
      delay: 4000,
      duration: 1500,
    });

    // Listen for game events
    this.gameScene.events.on('levelUpdate', (level) => {
      this.levelLabel.setText(`Level: ${level}`);
    });

    this.gameScene.events.on('livesUpdate', (lives) => {
      this.hearts.forEach((h, i) => {
        h.setAlpha(i < lives ? 1.0 : 0.25);
      });
      // Pulse remaining hearts
      if (lives > 0) {
        this.tweens.add({
          targets: this.hearts[lives - 1],
          scaleX: 1.4,
          scaleY: 1.4,
          duration: 120,
          yoyo: true,
        });
      }
    });

    this.gameScene.events.on('heightUpdate', (progress) => {
      const fillH = this._barHeight * progress;
      this.progressBarBg.height = fillH;
    });
  }
}
