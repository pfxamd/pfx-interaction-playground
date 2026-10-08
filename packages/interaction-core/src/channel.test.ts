import { describe, expect, it, vi } from 'vitest';
import { createInteractionValue, createScalarValue } from './channel.js';

describe('interaction values', () => {
  it('notifies subscribers without application state coupling', () => {
    const value = createInteractionValue(1, 0);
    const subscriber = vi.fn();
    const unsubscribe = value.subscribe(subscriber);

    value.set(2, 10);
    expect(subscriber).toHaveBeenCalledWith(2, 1);
    expect(value.getPrevious()).toBe(1);
    expect(value.getTimestamp()).toBe(10);

    unsubscribe();
    value.set(3, 20);
    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  it('tracks scalar velocity from timestamps', () => {
    const value = createScalarValue(0, 0);
    value.set(10, 100);
    expect(value.getVelocity()).toBe(100);
  });
});
