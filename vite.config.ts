import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'packages/widgets/src/index.ts',
      name: 'NumerosClaros',
      fileName: 'numerosclaros-spain',
      formats: ['es', 'umd'],
    },
    outDir: 'dist',
  },
});
