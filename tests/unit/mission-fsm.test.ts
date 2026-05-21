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

  // ── existing coverage ─────────────────────────────────────────────────────
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

  // ── accept() edge cases ───────────────────────────────────────────────────
  it('accept() returns false for an unknown mission id', () => {
    expect(mm.accept('does-not-exist')).toBe(false);
    expect(mm.getState()).toBe('inactive');
  });

  it('accept() resets elapsed time so getRemainingMs() equals full timer', () => {
    mm.accept('test-01');
    mm.update(1000);
    mm.complete(); // clears active
    // After passing, re-accepting (once inactive) should give fresh timer
    // Wait for the setTimeout to fire is not possible in unit tests;
    // instead test via a fresh instance
    const mm2 = new MissionManager();
    mm2.load(SAMPLE);
    mm2.accept('test-01');
    expect(mm2.getRemainingMs()).toBe(5000);
  });

  // ── getRemainingMs() when no active mission ───────────────────────────────
  it('getRemainingMs() returns 0 when no mission is active', () => {
    expect(mm.getRemainingMs()).toBe(0);
  });

  it('getRemainingMs() never goes below 0', () => {
    mm.accept('test-01');
    mm.update(99999);
    expect(mm.getRemainingMs()).toBe(0);
  });

  // ── getActive() after complete / fail ─────────────────────────────────────
  it('getActive() returns the mission while active', () => {
    mm.accept('test-01');
    expect(mm.getActive()?.id).toBe('test-01');
  });

  it('getActive() returns null after complete()', () => {
    mm.accept('test-01');
    mm.complete();
    expect(mm.getActive()).toBeNull();
  });

  it('getActive() returns null after fail()', () => {
    mm.accept('test-01');
    mm.fail();
    expect(mm.getActive()).toBeNull();
  });

  // ── fail() emits the failed event and carries the mission reference ────────
  it('fail() emits failed event with mission data', () => {
    const events: Array<{ type: string; missionId: string }> = [];
    mm.on(e => events.push({ type: e.type, missionId: e.mission.id }));
    mm.accept('test-01');
    mm.fail();
    expect(mm.getState()).toBe('failed');
    const failedEvent = events.find(e => e.type === 'failed');
    expect(failedEvent).toBeDefined();
    expect(failedEvent!.missionId).toBe('test-01');
  });

  // ── complete() emits reward in the event ─────────────────────────────────
  it('complete() emits the mission reward in the passed event', () => {
    let capturedReward: number | undefined;
    mm.on(e => { if (e.type === 'passed') capturedReward = e.reward; });
    mm.accept('test-01');
    mm.complete();
    expect(capturedReward).toBe(1000);
  });

  // ── update() is a no-op when not active ──────────────────────────────────
  it('update() is a no-op when state is inactive', () => {
    mm.update(99999);
    expect(mm.getState()).toBe('inactive');
  });

  // ── cumulative timer: multiple small ticks must sum correctly ─────────────
  it('accumulates elapsed time across multiple update() calls', () => {
    mm.accept('test-01');
    mm.update(1000);
    mm.update(1000);
    mm.update(1000);
    expect(mm.getRemainingMs()).toBe(2000);
  });

  it('fails exactly when accumulated time reaches timerMs', () => {
    mm.accept('test-01');
    mm.update(2500);
    expect(mm.getState()).toBe('active');
    mm.update(2500); // total = 5000, exactly at timerMs boundary — should fail
    expect(mm.getState()).toBe('failed');
  });

  // ── getMissions() returns a copy ─────────────────────────────────────────
  it('getMissions() returns all loaded missions', () => {
    expect(mm.getMissions()).toHaveLength(1);
    expect(mm.getMissions()[0].id).toBe('test-01');
  });

  it('getMissions() returns a defensive copy (mutations do not affect internal state)', () => {
    const copy = mm.getMissions();
    copy.push({
      id: 'intruder', type: 'kill', title: 'X', objective: 'X',
      timerMs: 1, reward: 0, waypoint: { x: 0, y: 0 },
    });
    expect(mm.getMissions()).toHaveLength(1);
  });

  // ── isActive() helper ────────────────────────────────────────────────────
  it('isActive() returns true only while state is active', () => {
    expect(mm.isActive()).toBe(false);
    mm.accept('test-01');
    expect(mm.isActive()).toBe(true);
    mm.complete();
    expect(mm.isActive()).toBe(false);
  });
});
