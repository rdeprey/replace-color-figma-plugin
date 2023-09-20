import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    includeSource: ['plugin-src/**/*.ts', 'ui-src/**/*.ts']
  }
});
