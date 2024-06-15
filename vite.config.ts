import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'template2react',
      fileName: 'index',
    },
     rollupOptions: {
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
  plugins: [dts({ rollupTypes: true })]
})
