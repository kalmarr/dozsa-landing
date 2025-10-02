import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        entryFileNames: 'booking-wizard.js',
        chunkFileNames: 'booking-wizard-[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'booking-wizard.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
})
