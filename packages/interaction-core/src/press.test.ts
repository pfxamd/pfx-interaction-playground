import { describe, expect, it } from 'vitest';
import { PressRecognizer } from './press.js';
import type { PointerSample } from './types.js';

const sample = (phase: PointerSample['phase'], x: number): PointerSample => ({
  kind: 'pointer',
  phase,
  timestamp: x,
  pointerId: 1,
  pointerType: 'mouse',
  position: { x, y: 0 },
  delta: { x: 0, y: 0 },
  pressure: phase === 'up' ? 0 : 0.5,
  buttons: phase === 'up' ? 0 : 1,
  modifiers: { shift: false, alt: false, ctrl: false, meta: false },
});

describe('PressRecognizer', () => {
  it('ends a press that stays inside the movement threshold', () => {
    const press = new PressRecognizer({ maxDistance: 8 });
    expect(press.handle(sample('down', 0))?.phase).toBe('start');
    expect(press.handle(sample('move', 4))).toBeNull();
    expect(press.handle(sample('up', 4))?.phase).toBe('end');
  });

  it('cancels immediately when the movement threshold is exceeded', () => {
    const press = new PressRecognizer({ maxDistance: 8 });
    press.handle(sample('down', 0));
    expect(press.handle(sample('move', 9))?.phase).toBe('cancel');
    expect(press.handle(sample('up', 9))).toBeNull();
  });
});
