import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import type { InlineConfig } from 'vitest/node'

// https://vite.dev/config/
// `test` is the vitest section (unit tests: `npm run test:unit`).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
} as UserConfig & { test: InlineConfig })
