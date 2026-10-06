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

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b3a91, 0x0b3a91, 0x071b45, 0x071b45, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 22; i += 1) {
      const x = 35 + i * 60;
      const colors = [0xfacc15, 0x38bdf8, 0xfb7185, 0x22c55e];
      this.add.rectangle(x, 45 + (i % 4) * 16, 12, 30, colors[i % colors.length], 0.9).setAngle(i % 2 ? -22 : 24);
    }

    this.add.text(width / 2, 105, 'ゴール！', {
      fontFamily: 'system-ui, sans-serif', fontSize: '78px', fontStyle: 'bold', color: '#ff9f0a',
      stroke: '#ffffff', strokeThickness: 12,
    }).setOrigin(0.5).setShadow(0, 8, '#061d4f', 8, true, true);

    this.add.rectangle(width / 2, 385, 760, 430, 0xf8fdff, 0.98)
      .setStrokeStyle(10, 0x21b6ff, 1);
    this.add.rectangle(width / 2, 385, 724, 394, 0xe8f8ff, 0.75).setStrokeStyle(3, 0xffffff, 0.9);

    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'system-ui, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#082f74',
    };
    const valueStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'system-ui, sans-serif', fontSize: '42px', fontStyle: 'bold', color: '#082f74',
    };

    this.add.text(340, 285, 'クリアタイム', labelStyle).setOrigin(0, 0.5);
    this.add.rectangle(770, 285, 330, 84, 0xffffff, 1).setStrokeStyle(5, 0x38bdf8, 1);
    this.add.text(770, 285, `${(timeMs / 1000).toFixed(2)} 秒`, valueStyle).setOrigin(0.5);

    this.add.image(282, 382, 'ui-coin').setDisplaySize(58, 58);
    this.add.text(340, 382, 'コイン', labelStyle).setOrigin(0, 0.5);
    this.add.rectangle(770, 382, 330, 84, 0xfffbeb, 1).setStrokeStyle(5, 0xf59e0b, 1);
    this.add.text(770, 382, `${coins} / 15`, { ...valueStyle, color: '#92400e' }).setOrigin(0.5);

    const retry = this.add.rectangle(470, 525, 300, 92, 0xff8a00, 1).setStrokeStyle(7, 0x7c2d12, 1).setInteractive({ useHandCursor: true });
    const retryText = this.add.text(470, 525, '↻ もう一度', { fontFamily: 'system-ui, sans-serif', fontSize: '34px', fontStyle: 'bold', color: '#ffffff', stroke: '#7c2d12', strokeThickness: 5 }).setOrigin(0.5);
    const title = this.add.rectangle(810, 525, 300, 92, 0x16a7f5, 1).setStrokeStyle(7, 0x082f74, 1).setInteractive({ useHandCursor: true });
    const titleText = this.add.text(810, 525, '⌂ タイトルへ', { fontFamily: 'system-ui, sans-serif', fontSize: '32px', fontStyle: 'bold', color: '#ffffff', stroke: '#082f74', strokeThickness: 5 }).setOrigin(0.5);

    const hover = (rect: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text, scale: number) => {
      this.tweens.add({ targets: [rect, text], scaleX: scale, scaleY: scale, duration: 100 });
    };
    retry.on('pointerover', () => hover(retry, retryText, 1.05));
    retry.on('pointerout', () => hover(retry, retryText, 1));
    title.on('pointerover', () => hover(title, titleText, 1.05));
    title.on('pointerout', () => hover(title, titleText, 1));
    retry.on('pointerdown', () => this.scene.start('game'));
    title.on('pointerdown', () => this.scene.start('menu'));

    this.add.text(width / 2, 655, 'SPACE / ENTER：もう一度　　ESC：タイトル', {
      fontFamily: 'system-ui, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffffff', stroke: '#082f74', strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0.9);

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('game'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('game'));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('menu'));
  }
}
