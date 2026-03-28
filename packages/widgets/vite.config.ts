import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NumerosClaros',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'numerosclaros.js' : 'numerosclaros.umd.js',
    },
    rollupOptions: {
      external: [],
    },
  },
});
