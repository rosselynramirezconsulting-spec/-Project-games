const PAIRS_NEEDED = 8;

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UI', active: false });
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const { width } = this.cameras.main;

    // Top HUD panel
    this.add.rectangle(width / 2, 28, width, 56, 0x000000, 0.45).setDepth(50);

    // Score
    this.scoreLabel = this.add.text(16, 14, 'Score: 0', {
      fontSize: '22px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#ffe066',
      stroke: '#333',
      strokeThickness: 3,
    }).setDepth(51);

    // Pairs counter
    this.pairsLabel = this.add.text(width - 16, 14, `Pairs: 0 / ${PAIRS_NEEDED}`, {
      fontSize: '22px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#aaffaa',
      stroke: '#333',
      strokeThickness: 3,
    }).setDepth(51).setOrigin(1, 0);

    // Instruction banner (fades out)
    const instText = this.add.text(width / 2, 80, 'Collect pairs of animals & bring them to the Ark!', {
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
    this.gameScene.events.on('scoreUpdate', (score) => {
      this.scoreLabel.setText(`Score: ${score}`);
    });

    this.gameScene.events.on('pairsUpdate', (pairs) => {
      this.pairsLabel.setText(`Pairs: ${pairs} / ${PAIRS_NEEDED}`);
      // Animate label on update
      this.tweens.add({
        targets: this.pairsLabel,
        scaleX: 1.2, scaleY: 1.2,
        duration: 120,
        yoyo: true,
      });
    });
  }
}
