import { defineConfig } from 'vitest/config'
import dts from 'unplugin-dts/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'template2react',
      fileName: 'index',
    },
    rolldownOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['pegjs'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          pegjs: 'pegjs',
        },
      },
    },
  },
  test: {
    watch: false,
    include: ['test/**/*.test.ts'],
    exclude: ['example/**'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['example/**', 'test/coverage/**'],
    },
  },
  plugins: [
    react(),
    dts({
      include: ['src/**/*.ts'],
      bundleTypes: true,
      outDirs: [{ dir: 'dist' }, { dir: 'dist', moduleFormat: 'cjs' }],
    }),
  ],
})
