import Phaser from 'phaser';
import { loadUiAssets } from '../utils/loadUiAssets';
import { readBest } from '../systems/RaceRecord';
import { sceneKey } from '../utils/sceneKeys';
import { button, cityBackdrop, text } from '../utils/ui';
export class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }
  preload(): void { loadUiAssets(this); }
  create(): void {
    document.querySelector('#game')?.setAttribute('data-scene', 'menu');
    cityBackdrop(this);
    this.add.rectangle(640, 340, 1040, 550, 0xffffff, 0.72).setStrokeStyle(2, 0xffffff);
    text(this, 640, 103, 'KEYBOARD PARKOUR / 01 CITY', 15, '#0891b2');
    const logo = this.add.image(640, 213, 'ui-logo');
    logo.setScale(Math.min(610 / logo.width, 180 / logo.height));
    text(this, 640, 327, 'A と D を交互に。リズムで駆け抜けろ。', 29);
    const best = readBest();
    text(this, 640, 377, best ? `CITY BEST  ${(best / 1000).toFixed(2)} s` : '最速タイムを、ここから。', 19, '#0e7490');
    let starting = false;
    const start = () => { if (!starting) { starting = true; this.scene.start('game'); } };
    button(this, 640, 458, 'START  →', start);
    text(this, 640, 538, 'A / D  左右の足     W  ジャンプ     S  スライド     SPACE  ダッシュ', 18);
    text(this, 640, 579, 'ENTER / SPACE でスタート • H で操作を確認', 16, '#64748b');
    sceneKey(this, 'keydown-ENTER', start);
    sceneKey(this, 'keydown-SPACE', start);
  }
}
