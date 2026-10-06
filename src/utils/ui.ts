import Phaser from 'phaser';
export function text(scene: Phaser.Scene, x: number, y: number, value: string, size = 24, color = '#163049'): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, { fontFamily: 'system-ui, sans-serif', fontSize: `${size}px`, color, fontStyle: 'bold' }).setOrigin(0.5);
}
export function button(scene: Phaser.Scene, x: number, y: number, label: string, action: () => void, primary = true): void {
  const box = scene.add.rectangle(x, y, primary ? 360 : 270, 76, primary ? 0x0891b2 : 0xffffff).setStrokeStyle(2, 0x67e8f9).setInteractive({ useHandCursor: true });
  const title = text(scene, x, y, label, 26, primary ? '#ffffff' : '#155e75');
  box.on('pointerover', () => { box.setAlpha(0.8); title.setY(y - 2); });
  box.on('pointerout', () => { box.setAlpha(1); title.setY(y); });
  box.on('pointerdown', action);
}
export function cityBackdrop(scene: Phaser.Scene): void {
  scene.add.rectangle(640, 360, 1280, 720, 0xe0f7ff);
  scene.add.circle(1030, 160, 72, 0xffffff, 0.9);
  for (let i = 0; i < 15; i++) {
    const x = i * 98, h = 80 + (i * 47) % 155;
    scene.add.rectangle(x, 720, 80, h + 130, 0x7dd3fc, 0.3).setOrigin(0.5, 1);
    for (let j = 0; j < 3; j++) scene.add.rectangle(x - 18 + j * 18, 620 - h / 2, 8, 30, 0xffffff, 0.65);
  }
}
