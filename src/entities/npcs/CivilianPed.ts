import Phaser from 'phaser';
import { NPC } from './NPC';

export class CivilianPed extends NPC {
  constructor(scene: Phaser.Scene, x: number, y: number) { super(scene, x, y, 'civilian', 30); }
  updateAI(_delta: number): void { /* wander FSM — to be implemented */ }
}
