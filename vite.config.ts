import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://devina-kit.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
