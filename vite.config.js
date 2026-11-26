import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/YPIA/Backend": "http://localhost",
      "/YPIA/Bukti": "http://localhost",
      "/YPIA/Assets": "http://localhost",
    },
  },
})
