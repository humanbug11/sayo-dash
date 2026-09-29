import Phaser from 'phaser';

type ResultData = {
  timeMs?: number;
  coins?: number;
};

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('result');
  }

  create(data: ResultData): void {
    const { width } = this.scale;
    const timeMs = Math.max(0, data.timeMs ?? 0);
    const coins = Math.max(0, data.coins ?? 0);

    this.cameras.main.setBackgroundColor('#0f172a');

    this.add
      .text(width / 2, 140, 'ゴール！', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '86px',
        fontStyle: 'bold',
        color: '#f97316',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 300, `${(timeMs / 1000).toFixed(2)} 秒`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 390, `コイン ${coins} / 15`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '34px',
        color: '#facc15',
      })
      .setOrigin(0.5);

    const retry = this.add
      .text(width / 2, 525, 'もう一度', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#2563eb',
        padding: { x: 44, y: 16 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    retry.on('pointerdown', () => this.scene.start('game'));

    const menu = this.add
      .text(width / 2, 620, 'タイトルへ', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menu.on('pointerdown', () => this.scene.start('menu'));

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('game'));
  }
}
