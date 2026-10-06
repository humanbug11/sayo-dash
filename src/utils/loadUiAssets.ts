import Phaser from 'phaser';

export function loadUiAssets(scene: Phaser.Scene): void {
  const images: Array<[string, string]> = [
    ['ui-logo', 'assets/ui/logo.webp'],
    ['runner-atlas', 'assets/character/rayn-atlas.png'],

    ['ui-goal-sign', 'assets/ui/goal_sign.webp'],
    ['ui-coin', 'assets/ui/coin.webp'],
  ];

  for (const [key, path] of images) {
    if (!scene.textures.exists(key)) scene.load.image(key, path);
  }
}
