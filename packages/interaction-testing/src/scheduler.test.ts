import { describe, expect, it, vi } from 'vitest';
import { createManualScheduler } from './scheduler.js';

describe('manual scheduler', () => {
  it('advances callbacks deterministically', () => {
    const scheduler = createManualScheduler(100);
    const callback = vi.fn();
    scheduler.request(callback);
    scheduler.advance(16);
    expect(callback).toHaveBeenCalledWith(116);
    expect(scheduler.pending).toBe(0);
  });

  it('supports cancellation', () => {
    const scheduler = createManualScheduler();
    const callback = vi.fn();
    const id = scheduler.request(callback);
    scheduler.cancel(id);
    scheduler.advance(16);
    expect(callback).not.toHaveBeenCalled();
  });
});
