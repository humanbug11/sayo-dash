import Phaser from 'phaser';
import { loadUiAssets } from '../utils/loadUiAssets';

type ResultData = { timeMs?: number; coins?: number };

export class ResultScene extends Phaser.Scene {
  constructor() { super('result'); }
  preload(): void { loadUiAssets(this); }

  create(data: ResultData): void {
    const { width, height } = this.scale;
    const timeMs = Math.max(0, data.timeMs ?? 0);
    const coins = Math.max(0, data.coins ?? 0);
    const seconds = timeMs / 1000;

    this.add.rectangle(width / 2, height / 2, width, height, 0x03142f, 0.72);
    this.add.circle(width / 2, 180, 150, 0x22d3ee, 0.12);
    this.add.circle(width / 2, 180, 105, 0xfacc15, 0.08);

    this.add.text(width / 2, 125, 'FINISH!', {
      fontFamily: 'system-ui, sans-serif', fontSize: '72px', fontStyle: 'bold',
      color: '#ffffff', stroke: '#082f74', strokeThickness: 12,
    }).setOrigin(0.5);

    const grade = seconds < 22 ? 'S' : seconds < 30 ? 'A' : seconds < 42 ? 'B' : 'C';
    const gradeColor = grade === 'S' ? '#facc15' : grade === 'A' ? '#22d3ee' : '#ffffff';

    this.add.text(width / 2, 235, grade, {
      fontFamily: 'system-ui, sans-serif', fontSize: '96px', fontStyle: 'bold',
      color: gradeColor, stroke: '#061d4f', strokeThickness: 12,
    }).setOrigin(0.5);

    this.add.text(width / 2, 340, `${seconds.toFixed(2)} 秒`, {
      fontFamily: 'system-ui, sans-serif', fontSize: '52px', fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.image(width / 2 - 85, 415, 'ui-coin').setDisplaySize(54, 54);
    this.add.text(width / 2 - 40, 415, `${coins} / 15`, {
      fontFamily: 'system-ui, sans-serif', fontSize: '34px', fontStyle: 'bold', color: '#ffe27a',
    }).setOrigin(0, 0.5);

    const makeButton = (x: number, label: string, color: number, action: () => void) => {
      const box = this.add.rectangle(x, 535, 300, 86, color, 1).setStrokeStyle(5, 0xffffff, 0.18)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(x, 535, label, {
        fontFamily: 'system-ui, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      box.on('pointerover', () => this.tweens.add({ targets: [box, txt], scaleX: 1.05, scaleY: 1.05, duration: 100 }));
      box.on('pointerout', () => this.tweens.add({ targets: [box, txt], scaleX: 1, scaleY: 1, duration: 100 }));
      box.on('pointerdown', action);
    };

    makeButton(width / 2 - 170, 'もう一度', 0xff8a00, () => this.scene.start('game'));
    makeButton(width / 2 + 170, 'タイトルへ', 0x1688ff, () => this.scene.start('menu'));

    this.add.text(width / 2, 635, 'SPACE / ENTER：もう一度　　ESC：タイトル', {
      fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#bfeeff',
    }).setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('game'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('game'));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('menu'));
  }
}
