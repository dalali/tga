export class AudioBus {
  static setMute(scene: Phaser.Scene, muted: boolean): void {
    scene.sound.mute = muted;
  }
}
