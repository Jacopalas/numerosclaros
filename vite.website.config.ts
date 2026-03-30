import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'website-entry.ts',
      name: 'NumerosClaros',
      fileName: 'numerosclaros-all',
      formats: ['umd'],
    },
    outDir: 'website/assets',
    emptyOutDir: false,
  },
});
