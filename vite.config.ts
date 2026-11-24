import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    assetsInlineLimit: (file) => (file.includes('flag-icons') ? false : undefined),
  },
})
