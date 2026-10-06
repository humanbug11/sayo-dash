import Phaser from 'phaser';

export function loadUiAssets(scene: Phaser.Scene): void {
  const images: Array<[string, string]> = [
    ['ui-logo', 'assets/ui/logo.webp'],
    ['ui-button-start', 'assets/ui/button_start.webp'],
    ['ui-hud', 'assets/ui/hud.webp'],
    ['ui-control-strip', 'assets/ui/control_strip.webp'],
    ['ui-goal-sign', 'assets/ui/goal_sign.webp'],
    ['ui-coin', 'assets/ui/coin.webp'],
  ];

  for (const [key, path] of images) {
    if (!scene.textures.exists(key)) scene.load.image(key, path);
  }
}
