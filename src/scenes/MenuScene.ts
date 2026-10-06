import Phaser from 'phaser';
import { loadUiAssets } from '../utils/loadUiAssets';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  preload(): void {
    loadUiAssets(this);
  }

  create(): void {
    const { width, height } = this.scale;

    this.createBackground(width, height);

    this.add.image(width / 2, 128, 'ui-logo').setDisplaySize(720, 240);

    this.add
      .text(width / 2, 248, 'A と D を交互に押して、気持ちよく加速！', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#0f172a',
        stroke: '#ffffff',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 286, 'ジャンプ・スライド・ダッシュを使い分けてゴールを目指そう', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#0f172a',
        stroke: '#ffffff',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.createFeatureCards();

    this.add.image(width / 2, 522, 'ui-control-strip').setDisplaySize(1040, 347);

    const hint = this.add
      .text(width / 2, 607, 'SPACE または ENTER でもスタート', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#0f172a',
        stroke: '#ffffff',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0.92);

    this.tweens.add({
      targets: hint,
      alpha: 0.45,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    const start = this.add
      .image(width / 2, 660, 'ui-button-start')
      .setDisplaySize(360, 120)
      .setInteractive({ useHandCursor: true });

    start.on('pointerover', () => {
      start.setDisplaySize(378, 126);
      this.tweens.add({ targets: start, angle: 1.2, duration: 120, yoyo: true });
    });
    start.on('pointerout', () => start.setDisplaySize(360, 120));
    start.on('pointerdown', () => this.scene.start('game'));

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('game'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('game'));
  }

  private createBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x67d4ff, 0x67d4ff, 0xe7f8ff, 0xe7f8ff, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 8; i += 1) {
      const x = 120 + i * 165;
      this.add.circle(x, 130 + (i % 2) * 18, 32, 0xffffff, 0.42);
      this.add.circle(x + 28, 118 + (i % 2) * 18, 24, 0xffffff, 0.42);
      this.add.circle(x + 58, 132 + (i % 2) * 18, 28, 0xffffff, 0.42);
    }

    for (let i = 0; i < 9; i += 1) {
      const x = 80 + i * 150;
      this.add.circle(x, 640, 55, 0x34d399, 0.35);
      this.add.circle(x + 40, 645, 45, 0x22c55e, 0.28);
    }

    this.add.rectangle(width / 2, 700, width, 90, 0x14532d, 0.85);
    this.add.rectangle(width / 2, 667, width, 18, 0xfacc15, 0.95);
  }

  private createFeatureCards(): void {
    const features = [
      { x: 240, title: '交互入力', body: 'A / D をリズムよく押すと\nパーフェクトでどんどん加速！', color: 0x38bdf8 },
      { x: 640, title: 'アクション', body: 'W でジャンプ、S でスライド。\n障害物に合わせて切り替えよう！', color: 0xf59e0b },
      { x: 1040, title: 'スコアアップ', body: 'コインを集めて、\n最短タイムでゴールを目指そう！', color: 0x22c55e },
    ];

    for (const feature of features) {
      this.add.rectangle(feature.x, 390, 320, 108, 0xffffff, 0.78).setStrokeStyle(6, feature.color, 0.95);
      this.add.circle(feature.x - 120, 358, 22, feature.color, 0.95);
      this.add
        .text(feature.x - 88, 340, feature.title, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '26px',
          fontStyle: 'bold',
          color: '#0f172a',
        })
        .setOrigin(0, 0.5);
      this.add
        .text(feature.x - 135, 385, feature.body, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          lineSpacing: 8,
          color: '#1e293b',
        })
        .setOrigin(0, 0.5);
    }
  }
}
