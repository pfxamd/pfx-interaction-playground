import { describe, expect, it } from 'vitest';
import { InteractionSession } from './session.js';

describe('InteractionSession', () => {
  it('increments the session id only for new starts', () => {
    const session = new InteractionSession();
    session.transition('start');
    expect(session.sessionId).toBe(1);
    session.transition('update');
    session.transition('end');
    session.transition('start');
    expect(session.sessionId).toBe(2);
  });

  it('rejects invalid transitions', () => {
    const session = new InteractionSession();
    expect(() => session.transition('update')).toThrow(/Invalid interaction transition/);
  });
});
