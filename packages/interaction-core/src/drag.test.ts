import { describe, expect, it } from 'vitest';
import { DragRecognizer } from './drag.js';
import type { PointerSample } from './types.js';

const sample = (
  phase: PointerSample['phase'],
  x: number,
  timestamp: number,
  shift = false,
): PointerSample => ({
  kind: 'pointer',
  phase,
  timestamp,
  pointerId: 1,
  pointerType: 'mouse',
  position: { x, y: 0 },
  delta: { x: 0, y: 0 },
  pressure: phase === 'up' ? 0 : 0.5,
  buttons: phase === 'up' ? 0 : 1,
  modifiers: { shift, alt: false, ctrl: false, meta: false },
});

describe('DragRecognizer', () => {
  it('keeps a stable lifecycle and offset', () => {
    const drag = new DragRecognizer();
    expect(drag.handle(sample('down', 10, 0))?.phase).toBe('start');
    const update = drag.handle(sample('move', 30, 16));
    expect(update?.phase).toBe('update');
    expect(update?.offset.x).toBe(20);
    expect(drag.handle(sample('up', 30, 32))?.phase).toBe('end');
  });

  it('supports an activation threshold', () => {
    const drag = new DragRecognizer({ activationDistance: 5 });
    expect(drag.handle(sample('down', 0, 0))?.phase).toBe('possible');
    expect(drag.handle(sample('move', 4, 16))?.phase).toBe('possible');
    expect(drag.handle(sample('move', 6, 32))?.phase).toBe('start');
  });

  it('cancels safely and preserves the latest modifiers', () => {
    const drag = new DragRecognizer();
    drag.handle(sample('down', 0, 0));
    drag.handle(sample('move', 4, 10, true));
    const cancelled = drag.cancel(12);
    expect(cancelled?.phase).toBe('cancel');
    expect(cancelled?.modifiers.shift).toBe(true);
    expect(drag.handle(sample('move', 8, 20))).toBeNull();
  });
});

describe('drag lifecycle edge cases', () => {
  it('ignores a second pointer while the first pointer owns the session', () => {
    const drag = new DragRecognizer();
    expect(drag.handle(sample('down', 0, 0))?.phase).toBe('start');
    const secondary = { ...sample('down', 40, 1), pointerId: 2 };
    expect(drag.handle(secondary)).toBeNull();
    expect(drag.handle({ ...secondary, phase: 'move' })).toBeNull();
    expect(drag.handle({ ...secondary, phase: 'up' })).toBeNull();
    expect(drag.handle(sample('move', 12, 16))?.offset.x).toBe(12);
    expect(drag.handle(sample('up', 12, 32))?.phase).toBe('end');
  });

  it('resets a pending gesture released before activation', () => {
    const drag = new DragRecognizer({ activationDistance: 10 });
    expect(drag.handle(sample('down', 0, 0))?.phase).toBe('possible');
    expect(drag.handle(sample('move', 4, 10))?.phase).toBe('possible');
    expect(drag.handle(sample('up', 4, 20))?.phase).toBe('cancel');
    expect(drag.handle(sample('move', 6, 30))).toBeNull();
    expect(drag.handle(sample('down', 2, 40))?.phase).toBe('possible');
    expect(drag.handle(sample('move', 20, 50))?.phase).toBe('start');
    expect(drag.handle(sample('cancel', 20, 60))?.phase).toBe('cancel');
  });

  it('rejects invalid activation distance', () => {
    expect(() => new DragRecognizer({ activationDistance: -1 })).toThrow(RangeError);
    expect(() => new DragRecognizer({ activationDistance: Number.NaN })).toThrow(RangeError);
    expect(() => new DragRecognizer({ activationDistance: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });
});

describe('device-independent pointer samples', () => {
  it.each(['touch', 'pen'] as const)('handles %s drag and cancellation', (pointerType) => {
    const drag = new DragRecognizer({ activationDistance: 3 });
    const touchDown = { ...sample('down', 0, 0), pointerType };
    expect(drag.handle(touchDown)?.phase).toBe('possible');
    const active = drag.handle({ ...sample('move', 12, 10), pointerType });
    expect(active?.phase).toBe('start');
    expect(active?.pointerType).toBe(pointerType);
    expect(active?.offset.x).toBe(12);
    expect(drag.handle({ ...sample('cancel', 12, 20), pointerType })?.phase).toBe('cancel');
    expect(drag.handle({ ...sample('move', 15, 30), pointerType })).toBeNull();
  });

  it('does not confuse a secondary input with the active pointer', () => {
    const drag = new DragRecognizer();
    expect(drag.handle({ ...sample('down', 0, 0), pointerId: 1, pointerType: 'mouse' })?.phase).toBe('start');
    expect(drag.handle({ ...sample('down', 10, 1), pointerId: 2, pointerType: 'touch' })).toBeNull();
    expect(drag.handle({ ...sample('cancel', 10, 2), pointerId: 2, pointerType: 'touch' })).toBeNull();
    expect(drag.handle({ ...sample('move', 7, 10), pointerId: 1, pointerType: 'mouse' })?.phase).toBe('update');
    expect(drag.handle({ ...sample('up', 7, 20), pointerId: 1, pointerType: 'mouse' })?.phase).toBe('end');
  });
});
