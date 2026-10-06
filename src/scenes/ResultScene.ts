import Phaser from 'phaser';
import { loadUiAssets } from '../utils/loadUiAssets';
import { readBest, saveBest, type RaceResult } from '../systems/RaceRecord';
import { sceneKey } from '../utils/sceneKeys';
import { button, cityBackdrop, text } from '../utils/ui';
export class ResultScene extends Phaser.Scene {
  constructor() { super('result'); }
  preload(): void { loadUiAssets(this); }
  create(data: RaceResult): void {
    document.querySelector('#game')?.setAttribute('data-scene', 'result');
    cityBackdrop(this);
    this.add.rectangle(640, 350, 880, 620, 0xffffff, 0.88).setStrokeStyle(2, 0xffffff);
    const previous = readBest();
    const record = saveBest(data.timeMs);
    const seconds = data.timeMs / 1000;
    const medal = seconds < 22 ? 'GOLD' : seconds < 30 ? 'SILVER' : seconds < 42 ? 'BRONZE' : 'FINISH';
    text(this, 640, 91, 'CITY CLEAR', 18, '#0891b2');
    text(this, 640, 142, 'GOAL!', 52);
    text(this, 640, 217, `${seconds.toFixed(2)} s`, 68);
    text(this, 640, 282, record ? 'NEW BEST!' : `BEST  ${((previous ?? data.timeMs) / 1000).toFixed(2)} s`, 23, '#0891b2');
    text(this, 640, 321, `${medal}${previous ? `  /  ${((data.timeMs - previous) / 1000).toFixed(2)} s vs BEST` : ''}`, 16, '#64748b');
    const stats: Array<[string, string]> = [
      ['PERFECT', `${data.steps ? Math.round(data.perfect / data.steps * 100) : 0}%`],
      ['MAX COMBO', String(data.maxCombo)], ['COIN', `${data.coins} / 15`], ['MISS', String(data.misses)],
    ];
    stats.forEach(([label, value], i) => {
      const x = 358 + i * 188;
      this.add.rectangle(x, 408, 170, 104, 0xe0f2fe, 0.7);
      text(this, x, 382, label, 14, '#0e7490'); text(this, x, 424, value, 30);
    });
    let leaving = false;
    const go = (name: string) => { if (!leaving) { leaving = true; this.scene.start(name); } };
    button(this, 490, 529, 'もう一度  ↻', () => go('game'));
    button(this, 830, 529, 'タイトルへ', () => go('menu'), false);
    text(this, 640, 605, 'ENTER / SPACE：もう一度    ESC：タイトル', 17, '#64748b');
    sceneKey(this, 'keydown-ENTER', () => go('game'));
    sceneKey(this, 'keydown-SPACE', () => go('game'));
    sceneKey(this, 'keydown-ESC', () => go('menu'));
  }
}
