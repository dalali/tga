export interface InputIntent {
  left: boolean; right: boolean; up: boolean; down: boolean;
  sprint: boolean; interact: boolean; fire: boolean;
}

export class InputManager {
  static fromKeys(keys: Record<string, Phaser.Input.Keyboard.Key>, cursors: Phaser.Types.Input.Keyboard.CursorKeys): InputIntent {
    return {
      left:     keys.A?.isDown || cursors.left.isDown,
      right:    keys.D?.isDown || cursors.right.isDown,
      up:       keys.W?.isDown || cursors.up.isDown,
      down:     keys.S?.isDown || cursors.down.isDown,
      sprint:   keys.SHIFT?.isDown ?? false,
      interact: keys.E?.isDown ?? false,
      fire:     keys.SPACE?.isDown ?? false,
    };
  }
}
