import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    // En CI : annotations sur GitHub + rapport JUnit lu par l'étape de rapport
    reporters: process.env.CI ? ['default', 'github-actions', 'junit'] : ['default'],
    outputFile: { junit: './test-reports/unit-junit.xml' },
  },
})
