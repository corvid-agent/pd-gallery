import { describe, it, expect } from 'vitest';
import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('should return short strings unchanged', () => {
    expect(pipe.transform('Hello', 150)).toBe('Hello');
  });

  it('should truncate long strings with ellipsis', () => {
    const long = 'a'.repeat(200);
    const result = pipe.transform(long, 150);
    expect(result.length).toBeLessThanOrEqual(153);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should use default limit of 150', () => {
    const long = 'b'.repeat(200);
    const result = pipe.transform(long);
    expect(result.length).toBeLessThanOrEqual(153);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should handle empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(pipe.transform(null as unknown as string)).toBeFalsy();
  });

  it('should handle exact limit length', () => {
    const exact = 'c'.repeat(150);
    expect(pipe.transform(exact, 150)).toBe(exact);
  });

  it('should trim trailing space before ellipsis', () => {
    const str = 'Hello world this is a test     more text here for padding and stuff to make it long enough to get truncated';
    const result = pipe.transform(str, 50);
    expect(result).not.toMatch(/\s\.\.\.$/);
    expect(result.endsWith('...')).toBe(true);
  });
});
