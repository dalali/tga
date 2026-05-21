import Phaser from 'phaser';
import { Entity } from '../Entity';

export type NPCState = 'idle' | 'wander' | 'chase' | 'flee' | 'dead';

export abstract class NPC extends Entity {
  protected aiState: NPCState = 'idle';
  protected aiStateTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, hp: number) {
    super(scene, x, y, texture, hp);
    this.setDepth(8);
  }

  abstract updateAI(delta: number): void;

  setAIState(s: NPCState): void {
    this.aiState = s;
    this.aiStateTimer = 0;
  }

  getAIState(): NPCState { return this.aiState; }
}
