import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: false,
    allowedHosts: ['dex.147.182.193.26.nip.io']
  },
  base: '/'
})
