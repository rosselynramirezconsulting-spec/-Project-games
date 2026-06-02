import { addScore, getScores } from '../utils/Scores.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.finalScore = data.score || 0;
    this.level      = data.level || 1;
    this.rank       = addScore(this.finalScore, this.level);
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
          targets: drop, y: H + 20,
          duration: Phaser.Math.Between(550, 950),
          onComplete: () => drop.destroy(),
        });
      },
    });

    // Rising water at bottom
    const waterY = H - 280;
    this.add.rectangle(W / 2, H - 140, W, 280, 0x0a2840);
    this.add.rectangle(W / 2, waterY,     W, 10, 0x1a6090, 0.95);
    this.add.rectangle(W / 2, waterY + 6, W, 5,  0x3a90c0, 0.5);
    const shimmer = this.add.rectangle(W / 2, waterY + 3, W, 4, 0x55aadd, 0.45);
    this.tweens.add({ targets: shimmer, x: W / 2 + 18, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Noah floating (blue-tinted)
    const noah = this.add.image(W / 2, waterY + 32, 'noah').setScale(1.5).setTint(0x6699cc);
    this.tweens.add({ targets: noah, y: waterY + 40, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: noah, angle: -14,      duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Broken hearts
    [-44, 0, 44].forEach((dx) => {
      this.add.image(W / 2 + dx, H * 0.56, 'heart').setScale(1.4).setTint(0x332222).setAlpha(0.45);
    });

    // GAME OVER title
    this.add.rectangle(W / 2, H * 0.17, W, 80, 0x000000, 0.55);
    const title = this.add.text(W / 2, H * 0.145, 'GAME OVER', {
      fontSize: '50px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#ff3333', stroke: '#660000', strokeThickness: 7,
    }).setOrigin(0.5).setAlpha(0);
    this.add.text(W / 2, H * 0.205, `You reached Level ${this.level}`, {
      fontSize: '16px', fontFamily: 'Arial', fill: '#99bbdd', stroke: '#112233', strokeThickness: 2,
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, alpha: 1, duration: 600, ease: 'Back.easeOut' });

    // Score row
    this.add.rectangle(W / 2, H * 0.285, 300, 44, 0x000000, 0.5);
    this.add.text(W / 2 - 60, H * 0.285, 'Score', {
      fontSize: '15px', fontFamily: 'Arial', fill: '#88bbdd',
    }).setOrigin(0.5);
    this.add.text(W / 2 + 44, H * 0.285, `${this.finalScore}`, {
      fontSize: '24px', fontFamily: 'Arial', fontStyle: 'bold',
      fill: '#ffe066', stroke: '#333', strokeThickness: 3,
    }).setOrigin(0.5);

    // ── Rankings panel ────────────────────────────────────────────────
    this._drawLeaderboard(W / 2, H * 0.325, this.rank);

    // ── Buttons ───────────────────────────────────────────────────────
    const retryBtn = this.add.rectangle(W / 2, H * 0.76, 240, 60, 0xcc4400)
      .setInteractive({ useHandCursor: true });
    const retryHL  = this.add.rectangle(W / 2, H * 0.76 - 10, 228, 20, 0xffffff, 0.14);
    this.add.text(W / 2, H * 0.76, '↺  Try Again', {
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

    const menuBtn = this.add.rectangle(W / 2, H * 0.875, 180, 44, 0x334466)
      .setInteractive({ useHandCursor: true });
    this.add.text(W / 2, H * 0.875, 'Main Menu', {
      fontSize: '20px', fontFamily: 'Arial', fill: '#aabbcc',
    }).setOrigin(0.5);
    menuBtn.on('pointerdown', () => this.scene.start('Menu'));
  }

  _drawLeaderboard(cx, topY, newRank) {
    const scores = getScores();
    const rows   = Math.min(scores.length, 5);
    const rowH   = 28;
    const panelH = 28 + rows * rowH + 6;

    this.add.rectangle(cx, topY + panelH / 2, 310, panelH, 0x000000, 0.52).setOrigin(0.5);
    this.add.text(cx, topY + 13, 'HIGH SCORES', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#aaddff',
    }).setOrigin(0.5);

    const MEDAL = ['#ffd700', '#c0c0c0', '#cd7f32', '#99aabb', '#99aabb'];

    scores.slice(0, 5).forEach(({ score, level }, i) => {
      const y      = topY + 28 + i * rowH + rowH / 2;
      const isNew  = (i + 1 === newRank);
      const col    = isNew ? '#ffee44' : MEDAL[i];

      if (isNew) {
        this.add.rectangle(cx, y, 298, rowH - 2, 0xffcc00, 0.18).setOrigin(0.5);
        const star = this.add.text(cx + 130, y, 'NEW', {
          fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold', fill: '#ffee44',
        }).setOrigin(0.5);
        this.tweens.add({ targets: star, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
      }

      this.add.text(cx - 135, y, `#${i + 1}`, {
        fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', fill: col,
      }).setOrigin(0, 0.5);
      this.add.text(cx + 50, y, `${score}`, {
        fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold', fill: col,
      }).setOrigin(1, 0.5);
      this.add.text(cx + 80, y, `Lv.${level}`, {
        fontSize: '12px', fontFamily: 'Arial', fill: '#88aacc',
      }).setOrigin(0, 0.5);
    });
  }
}
