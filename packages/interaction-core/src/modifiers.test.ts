import { describe, expect, it } from 'vitest';
import { axisLock, bounds, detents, softBounds } from './modifiers.js';

const context = {
  value: { x: 12, y: -4 },
  previous: { x: 5, y: 5 },
  velocity: { x: 100, y: -50 },
};

describe('point modifiers', () => {
  it('locks both value and velocity to the selected axis', () => {
    const result = axisLock('x')(context);
    expect(result.value).toEqual({ x: 12, y: 5 });
    expect(result.velocity).toEqual({ x: 100, y: 0 });
  });

  it('clamps values and clears velocity on constrained axes', () => {
    const result = bounds({ minX: 0, maxX: 10, minY: 0, maxY: 10 })(context);
    expect(result.value).toEqual({ x: 10, y: 0 });
    expect(result.velocity).toEqual({ x: 0, y: 0 });
  });

  it('applies soft resistance outside bounds', () => {
    const result = softBounds({ minX: 0, maxX: 10, minY: 0, maxY: 10 }, 0.25)(context);
    expect(result.value).toEqual({ x: 10.5, y: -1 });
  });
});

describe('detents', () => {
  it('snaps at low velocity and escapes at high velocity', () => {
    const modifier = detents([0, 10, 20], 2, 50);
    expect(modifier(9, 10)).toBe(10);
    expect(modifier(9, 100)).toBe(9);
  });
});
