import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    lib: {
      entry: './src/main.tsx',
      name: 'BookingWizard',
      formats: ['iife'],
      fileName: () => 'booking-wizard.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'booking-wizard.[ext]',
      },
    },
  },
})
