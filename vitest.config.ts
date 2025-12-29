import { defineConfig } from 'vitest/config';
import { execFileSync } from 'child_process';

// Get Trove API key from macOS Keychain if not in environment
let troveApiKey = process.env.TROVE_API_KEY;
if (!troveApiKey) {
  try {
    troveApiKey = execFileSync('security', ['find-generic-password', '-s', 'trove-api-key', '-w'], {
      encoding: 'utf-8',
    }).trim();
  } catch {
    // Key not in keychain - tests will skip
  }
}

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000, // 30s for API calls
    hookTimeout: 10000,
    include: ['tests/**/*.test.ts'],
    // Set environment variable for tests
    env: {
      TROVE_API_KEY: troveApiKey ?? '',
    },
  },
});
