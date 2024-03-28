import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'
import { resolve, dirname } from 'node:path'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: '.',
      coverage: {
        all: true,
        provider: 'istanbul',
        reporter: ['text']
      },
      setupFiles: ['./setupFetch.ts', './setupCrypto.ts']
    },
    resolve: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  })
)
