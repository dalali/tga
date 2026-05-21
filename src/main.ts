import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { WorldScene } from './scenes/WorldScene';
import { HUDScene } from './scenes/HUDScene';
import { PauseScene } from './scenes/PauseScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1A1A1F',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: import.meta.env.DEV },
  },
  scene: [BootScene, MenuScene, WorldScene, HUDScene, PauseScene],
};

new Phaser.Game(config);
