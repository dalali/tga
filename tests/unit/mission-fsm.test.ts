import { describe, it, expect, beforeEach } from 'vitest';
import { MissionManager } from '../../src/systems/MissionManager';
import type { Mission } from '../../src/types/missions';

const SAMPLE: Mission[] = [
  {
    id: 'test-01', type: 'deliver',
    title: 'Test', objective: 'Do the thing',
    timerMs: 5000, reward: 1000,
    waypoint: { x: 100, y: 100, label: 'GOAL' },
  },
];

describe('MissionManager', () => {
  let mm: MissionManager;
  beforeEach(() => { mm = new MissionManager(); mm.load(SAMPLE); });

  it('accepts a valid mission', () => {
    expect(mm.accept('test-01')).toBe(true);
    expect(mm.getState()).toBe('active');
  });

  it('fails on timer expiry', () => {
    mm.accept('test-01');
    mm.update(6000);
    expect(mm.getState()).toBe('failed');
  });

  it('rejects double-accept while active', () => {
    mm.accept('test-01');
    expect(mm.accept('test-01')).toBe(false);
  });

  it('completes cleanly and emits event', () => {
    const events: string[] = [];
    mm.on(e => events.push(e.type));
    mm.accept('test-01');
    mm.complete();
    expect(mm.getState()).toBe('passed');
    expect(events).toContain('started');
    expect(events).toContain('passed');
  });

  it('returns correct remaining time', () => {
    mm.accept('test-01');
    mm.update(2000);
    expect(mm.getRemainingMs()).toBe(3000);
  });
});
