import Phaser from 'phaser';
import { loadUiAssets } from '../utils/loadUiAssets';

export class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }

  preload(): void { loadUiAssets(this); }

  create(): void {
    const { width, height } = this.scale;

    const haze = this.add.graphics();
    haze.fillStyle(0x56d8ff, 0.22);
    haze.fillRoundedRect(70, 56, width - 140, height - 112, 34);
    haze.lineStyle(2, 0xffffff, 0.16);
    haze.strokeRoundedRect(70, 56, width - 140, height - 112, 34);

    this.add.image(width / 2, 180, 'ui-logo').setDisplaySize(650, 220);

    this.add.text(width / 2, 300, 'A ⇄ D を交互に踏んで、最高速へ。', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '31px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#082f74',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(width / 2, 342, 'タイミングを合わせるほど加速。ジャンプ・スライド・ダッシュで駆け抜けろ！', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#dff8ff',
      stroke: '#082f74',
      strokeThickness: 5,
    }).setOrigin(0.5);

    const start = this.add.image(width / 2, 470, 'ui-button-start')
      .setDisplaySize(390, 130)
      .setInteractive({ useHandCursor: true });
    this.tweens.add({
      targets: start,
      scaleX: 1.035,
      scaleY: 1.035,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    start.on('pointerover', () => start.setTint(0xfff4c2));
    start.on('pointerout', () => start.clearTint());
    start.on('pointerdown', () => this.scene.start('game'));

    this.add.text(width / 2, 575, 'A / D 走る　　W ジャンプ　　S スライド　　SPACE ダッシュ', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(5,31,71,.64)',
      padding: { left: 18, right: 18, top: 10, bottom: 10 },
    }).setOrigin(0.5);

    const footer = this.add.text(width / 2, 645, 'PERFECT をつなげて最高速を狙え', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#8bf3ff',
    }).setOrigin(0.5);

    this.tweens.add({ targets: footer, alpha: 0.35, duration: 850, yoyo: true, repeat: -1 });

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('game'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('game'));
  }
}
