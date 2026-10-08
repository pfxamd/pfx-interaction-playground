import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { applyPrecision, clamp, mapRange, normalize, stepValue, wrap } from './values.js';

describe('values', () => {
  it('clamps every finite value into the requested range', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true, noDefaultInfinity: true }), (value) => {
        const result = clamp(value, -10, 10);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThanOrEqual(10);
      }),
    );
  });

  it('normalizes and maps ranges', () => {
    expect(normalize(5, 0, 10)).toBe(0.5);
    expect(mapRange(0.5, 0, 1, -1, 1)).toBe(0);
  });

  it('wraps values into a half-open interval', () => {
    expect(wrap(370, 0, 360)).toBe(10);
    expect(wrap(-10, 0, 360)).toBe(350);
  });
});

describe('value validation', () => {
  it('rejects invalid precision and step configuration', () => {
    expect(() => applyPrecision(1, true, Number.NaN)).toThrow(RangeError);
    expect(() => stepValue(1, Number.NaN)).toThrow(RangeError);
  });
});
