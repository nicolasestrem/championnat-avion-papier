import { describe, it, expect } from 'vitest';
import { slugify } from '../../src/utils/slugify';

describe('slugify', () => {
  it('should convert basic strings', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello World!@#$%^&*()')).toBe('hello-world');
  });

  it('should handle accented characters', () => {
    expect(slugify('àéìòù')).toBe('aeiou');
  });

  it('should handle leading/trailing hyphens', () => {
    expect(slugify('-Hello World-')).toBe('hello-world');
  });

  it('should handle null input', () => {
    expect(slugify(null)).toBe('');
  });

  it('should handle undefined input', () => {
    expect(slugify(undefined)).toBe('');
  });

  it('should return an empty string for an empty input', () => {
    expect(slugify('')).toBe('');
  });
});