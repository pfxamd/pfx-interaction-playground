import { describe, expect, it } from 'vitest';
import { wheelState } from './wheel.js';

describe('wheelState', () => {
  it('preserves delta mode and derives direction', () => {
    const state = wheelState({
      kind: 'wheel',
      timestamp: 1,
      delta: { x: -2, y: 4 },
      deltaMode: 'line',
      position: { x: 10, y: 20 },
      modifiers: { shift: false, alt: false, ctrl: false, meta: false },
    });

    expect(state.deltaMode).toBe('line');
    expect(state.direction).toEqual({ x: -1, y: 1 });
  });
});
