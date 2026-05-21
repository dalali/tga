import Phaser from 'phaser';
import { GameState } from '../state/GameState';
import { EVENTS } from '../state/events';

const HP_BAR_W = 120;
const HP_BAR_H = 10;
const MINIMAP_W = 80;
const MINIMAP_H = 80;

export class HUDScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private starsText!: Phaser.GameObjects.Text;
  private hpBarFill!: Phaser.GameObjects.Rectangle;
  private weaponText!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'HUDScene' }); }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // --- Score: top-left ---
    this.scoreText = this.add.text(16, 16, '$0', {
      fontSize: '18px',
      color: '#F5D800',
      fontFamily: 'monospace',
    }).setDepth(200);

    // --- Wanted stars: top-right ---
    this.starsText = this.add.text(W - 16, 16, '☆☆☆☆', {
      fontSize: '18px',
      color: '#555555',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setDepth(200);

    // --- HP bar: bottom-right ---
    const hpX = W - 16 - HP_BAR_W;
    const hpY = H - 30;

    // Background track
    this.add.rectangle(hpX + HP_BAR_W / 2, hpY + HP_BAR_H / 2, HP_BAR_W, HP_BAR_H, 0x440000)
      .setDepth(200);

    // Fill bar (full = green)
    this.hpBarFill = this.add.rectangle(
      hpX, hpY, HP_BAR_W, HP_BAR_H, 0x44cc44
    ).setOrigin(0, 0).setDepth(201);

    // HP label
    this.add.text(hpX - 4, hpY, 'HP', {
      fontSize: '10px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setDepth(200);

    // --- Weapon text: bottom-right, above HP bar ---
    this.weaponText = this.add.text(W - 16, H - 48, 'FISTS', {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setDepth(200);

    // --- Mini-map placeholder: bottom-left ---
    this.add.rectangle(
      16 + MINIMAP_W / 2,
      H - 16 - MINIMAP_H / 2,
      MINIMAP_W,
      MINIMAP_H,
      0x000000,
      0.5
    ).setDepth(200);
    this.add.text(16 + MINIMAP_W / 2, H - 16 - MINIMAP_H / 2, 'MAP', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5).setDepth(201);

    // --- Registry event listeners ---
    this.registry.events.on('changedata-score', (_parent: unknown, value: number) => {
      this.scoreText.setText(`$${value.toLocaleString()}`);
    });

    this.registry.events.on('changedata-wanted', (_parent: unknown, level: number) => {
      const filled = '★'.repeat(level);
      const empty  = '☆'.repeat(4 - level);
      this.starsText.setText(filled + empty)
        .setColor(level > 0 ? '#E03030' : '#555555');
    });

    this.registry.events.on('changedata-hp', (_parent: unknown, hp: number) => {
      const ratio = Phaser.Math.Clamp(hp / 100, 0, 1);
      this.hpBarFill.setDisplaySize(HP_BAR_W * ratio, HP_BAR_H);
      // Colour: green → yellow → red
      if (ratio > 0.5) {
        this.hpBarFill.setFillStyle(0x44cc44);
      } else if (ratio > 0.25) {
        this.hpBarFill.setFillStyle(0xddcc00);
      } else {
        this.hpBarFill.setFillStyle(0xcc2222);
      }
    });

    this.registry.events.on('changedata-weapon', (_parent: unknown, weapon: string) => {
      this.weaponText.setText(weapon === 'none' ? 'FISTS' : weapon.toUpperCase());
    });

    // Also listen to legacy named events (emitted by other systems)
    this.registry.events.on(EVENTS.SCORE_CHANGED, (score: number) => {
      this.scoreText.setText(`$${score.toLocaleString()}`);
    });
    this.registry.events.on(EVENTS.WANTED_CHANGED, (level: number) => {
      const filled = '★'.repeat(level);
      const empty  = '☆'.repeat(4 - level);
      this.starsText.setText(filled + empty)
        .setColor(level > 0 ? '#E03030' : '#555555');
    });
    this.registry.events.on(EVENTS.HP_CHANGED, (hp: number) => {
      const ratio = Phaser.Math.Clamp(hp / 100, 0, 1);
      this.hpBarFill.setDisplaySize(HP_BAR_W * ratio, HP_BAR_H);
    });
    this.registry.events.on(EVENTS.WEAPON_CHANGED, (weapon: string) => {
      this.weaponText.setText(weapon === 'none' ? 'FISTS' : weapon.toUpperCase());
    });

    // --- Mission strip ---
    const missionBg = this.add.rectangle(W / 2, H - 14, W, 24, 0x00E5CC, 0.85)
      .setOrigin(0.5, 0.5).setDepth(199).setVisible(false);
    const missionText = this.add.text(W / 2, H - 14, '', {
      fontSize: '11px', color: '#001a15', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5).setDepth(202).setVisible(false);
    const missionTimer = this.add.text(W - 120, H - 14, '', {
      fontSize: '11px', color: '#001a15', fontFamily: 'monospace',
    }).setOrigin(0, 0.5).setDepth(202).setVisible(false);

    this.registry.events.on('changedata-missionState', (_: unknown, state: string) => {
      const active = state === 'active';
      missionBg.setVisible(active);
      missionText.setVisible(active);
      missionTimer.setVisible(active);
      if (state === 'passed') {
        const text = this.registry.get('missionText') as string;
        this.showBanner(text, 0x3DCC3D);
      } else if (state === 'failed') {
        this.showBanner('MISSION FAILED', 0xE03030);
      }
    });

    this.registry.events.on('changedata-missionText', (_: unknown, text: string) => {
      missionText.setText(text);
    });

    // Update mission timer each tick
    this.time.addEvent({ delay: 250, loop: true, callback: () => {
      const state = this.registry.get('missionState') as string | undefined;
      if (state === 'active') {
        const remaining = this.registry.get('missionRemaining') as number | undefined ?? 0;
        const secs = Math.ceil(remaining / 1000);
        missionTimer.setText(`${secs}s`);
      }
    }});

    // --- Win overlay ---
    this.registry.events.on('changedata-won', (_: unknown, won: boolean) => {
      if (!won) return;
      this.showWinScreen();
    });

    // --- Bust flash ---
    this.registry.events.on('changedata-busted', () => {
      this.showBanner('WASTED', 0xE03030, 2000);
    });

    // Mute key
    this.input.keyboard!.on('keydown-M', () => { this.sound.mute = !this.sound.mute; });
    void GameState;
  }

  private showBanner(text: string, color: number, duration = 3000): void {
    const W = this.scale.width;
    const H = this.scale.height;
    const banner = this.add.text(W / 2, H / 2, text, {
      fontSize: '36px', color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0.5).setDepth(300);
    this.time.delayedCall(duration, () => banner.destroy());
  }

  private showWinScreen(): void {
    const W = this.scale.width;
    const H = this.scale.height;
    const score = this.registry.get('score') as number ?? 0;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(290).setOrigin(0.5);
    this.add.text(W / 2, H / 2 - 60, 'LEVEL COMPLETE', {
      fontSize: '40px', color: '#F5D800', fontFamily: 'monospace', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(300);
    this.add.text(W / 2, H / 2, `SCORE: $${score.toLocaleString()}`, {
      fontSize: '22px', color: '#E8E4D4', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(300);
    this.add.text(W / 2, H / 2 + 60, 'Refresh to play again', {
      fontSize: '16px', color: '#888888', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(300);
  }
}
