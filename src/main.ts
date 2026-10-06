import Phaser from 'phaser';
import './style.css';
import { ThreeBackdrop } from './visuals/ThreeBackdrop';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';

const gameHost = document.querySelector<HTMLElement>('#game');
if (!gameHost) throw new Error('game host not found');
try { new ThreeBackdrop(gameHost); } catch { /* Phaser can use canvas when WebGL is unavailable. */ }

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  transparent: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 1600 }, debug: false },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, roundPixels: true },
  scene: [MenuScene, GameScene, ResultScene],
};

export const game = new Phaser.Game(config);
