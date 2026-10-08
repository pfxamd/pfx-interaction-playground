import { describe, expect, it } from 'vitest';
import { animateInertia, animateSpring, inertiaStep, springStep } from './physics.js';

describe('physics', () => {
  it('spring moves toward its target', () => {
    const next = springStep({ position: 0, velocity: 0 }, 100, 1 / 60);
    expect(next.position).toBeGreaterThan(0);
    expect(next.velocity).toBeGreaterThan(0);
  });

  it('inertia reduces velocity with friction', () => {
    const next = inertiaStep({ position: 0, velocity: 100 }, 1 / 60, { friction: 8 });
    expect(next.position).toBeGreaterThan(0);
    expect(next.velocity).toBeLessThan(100);
  });
});

it('rejects non-finite physics configuration', () => {
  expect(() => springStep({ position: 0, velocity: 0 }, 1, 1 / 60, { stiffness: Number.NaN })).toThrow(RangeError);
  expect(() => inertiaStep({ position: 0, velocity: 1 }, 1 / 60, { friction: Number.POSITIVE_INFINITY })).toThrow(RangeError);
});

describe('scheduled motion lifecycle', () => {
  const makeScheduler = () => {
    let time = 0;
    let nextId = 0;
    const pending = new Map<number, (timestamp: number) => void>();
    const scheduler = {
      now: () => time,
      request(callback: (timestamp: number) => void) {
        const id = ++nextId;
        pending.set(id, callback);
        return id;
      },
      cancel(id: number) {
        pending.delete(id);
      },
    };
    const advance = (milliseconds = 16) => {
      time += milliseconds;
      const callbacks = [...pending.values()];
      pending.clear();
      for (const callback of callbacks) callback(time);
    };
    return { scheduler, pending, advance };
  };

  it('converges to the target and completes exactly once', () => {
    const { scheduler, pending, advance } = makeScheduler();
    const positions: number[] = [];
    let completions = 0;
    const animation = animateSpring({
      scheduler,
      from: { position: 0, velocity: 0 },
      target: 100,
      onUpdate: (state) => positions.push(state.position),
      onComplete: () => { completions += 1; },
    });
    for (let frame = 0; frame < 600 && animation.running; frame += 1) advance();
    expect(animation.running).toBe(false);
    expect(positions.at(-1)).toBe(100);
    expect(completions).toBe(1);
    expect(pending.size).toBe(0);
  });

  it('cancel stops scheduled callbacks and prevents completion', () => {
    const { scheduler, pending, advance } = makeScheduler();
    let completions = 0;
    const animation = animateSpring({
      scheduler,
      from: { position: 0, velocity: 0 },
      target: 100,
      onUpdate: () => {},
      onComplete: () => { completions += 1; },
    });
    advance();
    animation.cancel();
    expect(animation.running).toBe(false);
    expect(pending.size).toBe(0);
    advance();
    expect(completions).toBe(0);
  });

  it('stops bounded inertia at the upper limit', () => {
    const { scheduler, advance } = makeScheduler();
    const positions: number[] = [];
    const animation = animateInertia({
      scheduler,
      from: { position: 9, velocity: 200 },
      min: 0,
      max: 10,
      elasticity: 0,
      onUpdate: (state) => positions.push(state.position),
    });
    for (let frame = 0; frame < 120 && animation.running; frame += 1) advance();
    expect(animation.running).toBe(false);
    expect(positions.at(-1)).toBe(10);
  });
});
