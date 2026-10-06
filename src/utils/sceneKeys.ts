import Phaser from 'phaser';

// KeyboardPlugin belongs to the input manager; remove handlers when a scene stops.
export function sceneKey(scene: Phaser.Scene, event: string, action: () => void): void {
  const keyboard = scene.input.keyboard;
  keyboard?.on(event, action);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => keyboard?.off(event, action));
}
