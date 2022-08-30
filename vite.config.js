import { defineConfig } from "vite"
import path from "path"
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 65536,
    lib: {
      entry: path.resolve('./src/index.ts'),
      name: 'meshbaker',
      fileName: (format) => `meshbaker.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'three', 'react-dom'],
      output: {
        globals: {
          react: 'React'
        }
      }
    }
  }
})
