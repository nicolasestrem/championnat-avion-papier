import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/utils/**/*.test.ts'],
    globals: true,
  },
});