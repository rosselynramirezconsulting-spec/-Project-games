export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    // Ark decoration
    this.add.image(width / 2, height * 0.38, 'ark').setScale(2.2);

    // Water
    this.add.image(width / 2, height * 0.54, 'water').setDisplaySize(width, 120);

    // Floating animals in a row
    const animals = ['elephant', 'giraffe', 'lion', 'zebra', 'monkey', 'rabbit', 'penguin', 'bear'];
    animals.forEach((a, i) => {
      const x = 30 + (i % 4) * 90;
      const y = height * 0.68 + Math.floor(i / 4) * 70;
      const sprite = this.add.image(x, y, a).setScale(1.2);
      this.tweens.add({
        targets: sprite,
        y: y - 10,
        duration: 900 + i * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // Title panel
    const panel = this.add.rectangle(width / 2, height * 0.12, 360, 90, 0x000000, 0.35).setOrigin(0.5);
    this.add.text(width / 2, height * 0.10, "Noah's Ark", {
      fontSize: '42px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#ffe066',
      stroke: '#7a4200',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.155, 'Adventure!', {
      fontSize: '26px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      stroke: '#7a4200',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtitle — updated for vertical platformer
    this.add.text(width / 2, height * 0.59, 'Jump up platforms to reach the Ark!', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      stroke: '#1a5a90',
      strokeThickness: 3,
      wordWrap: { width: 340 },
      align: 'center',
    }).setOrigin(0.5);

    // Play button
    const btnBg = this.add.rectangle(width / 2, height * 0.87, 220, 64, 0xff8c00).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const btnHighlight = this.add.rectangle(width / 2, height * 0.87 - 6, 210, 26, 0xffbb44, 0.4).setOrigin(0.5);
    this.add.text(width / 2, height * 0.87, '▶  PLAY', {
      fontSize: '30px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#7a4200',
      strokeThickness: 4,
    }).setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      this.tweens.add({
        targets: [btnBg, btnHighlight],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: () => this.scene.start('Game', { level: 1, score: 0 }),
      });
    });

    // Bounce the button gently
    this.tweens.add({
      targets: btnBg,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
