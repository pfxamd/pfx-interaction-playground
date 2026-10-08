import type { Scheduler } from '@pfx/interaction-core';

/** @public */
export interface ManualScheduler extends Scheduler {
  advance(milliseconds: number): void;
  flush(maxFrames?: number, frameMs?: number): void;
  readonly pending: number;
}

/** @public */
export function createManualScheduler(startTime = 0): ManualScheduler {
  let time = startTime;
  let nextId = 0;
  const queue = new Map<number, (timestamp: number) => void>();

  return {
    now: () => time,
    request(callback) {
      const id = ++nextId;
      queue.set(id, callback);
      return id;
    },
    cancel(id) {
      queue.delete(id);
    },
    advance(milliseconds) {
      if (!Number.isFinite(milliseconds) || milliseconds < 0) {
        throw new RangeError('milliseconds must be a finite value >= 0');
      }
      time += milliseconds;
      const callbacks = [...queue.values()];
      queue.clear();
      for (const callback of callbacks) callback(time);
    },
    flush(maxFrames = 1000, frameMs = 1000 / 60) {
      if (!Number.isInteger(maxFrames) || maxFrames < 0) {
        throw new RangeError('maxFrames must be an integer >= 0');
      }
      if (!Number.isFinite(frameMs) || frameMs < 0) {
        throw new RangeError('frameMs must be a finite value >= 0');
      }
      let frames = 0;
      while (queue.size > 0 && frames < maxFrames) {
        this.advance(frameMs);
        frames += 1;
      }
      if (queue.size > 0) throw new Error('Manual scheduler did not settle');
    },
    get pending() {
      return queue.size;
    },
  };
}
