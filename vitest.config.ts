import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Only run unit tests; e2e Playwright specs are run via `npm run test:e2e`
    include: ['tests/unit/**/*.test.ts'],
    // Pathfinder tests use easystarjs async callbacks; allow headroom when
    // all test files run concurrently in workers.
    testTimeout: 15000,
  },
});
