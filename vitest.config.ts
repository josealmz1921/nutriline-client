import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
    // Limitar jsdom concurrente evita saturar CPU/memoria al crecer las suites de UI.
    maxWorkers: 2,
  },
}));
