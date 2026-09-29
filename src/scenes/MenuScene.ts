import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x7dd3fc, 0x7dd3fc, 0xe0f2fe, 0xe0f2fe, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 130, '左右でダッシュ！', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '78px',
        fontStyle: 'bold',
        color: '#0f172a',
        stroke: '#ffffff',
        strokeThickness: 10,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 230, 'A と D を交互に押して、ゴールを目指せ！', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '30px',
        color: '#0f172a',
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        390,
        'A / D：左右の足\nW：ジャンプ\nS：スライディング\nSPACE：ダッシュ',
        {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '28px',
          lineSpacing: 10,
          align: 'center',
          color: '#1e293b',
        },
      )
      .setOrigin(0.5);

    const start = this.add
      .text(width / 2, 585, 'スタート', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#ea580c',
        padding: { x: 52, y: 18 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    start.on('pointerover', () => start.setScale(1.04));
    start.on('pointerout', () => start.setScale(1));
    start.on('pointerdown', () => this.scene.start('game'));

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('game'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('game'));
  }
}
