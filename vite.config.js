import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const stampServiceWorker = () => ({
  name: 'stamp-service-worker',
  closeBundle() {
    const swPath = path.resolve(__dirname, 'dist/service-worker.js')
    if (!fs.existsSync(swPath)) return
    const buildId = Date.now().toString(36)
    const source = fs.readFileSync(swPath, 'utf8')
    fs.writeFileSync(swPath, source.replace('self.__BUILD_ID__', JSON.stringify(buildId)))
  },
})

export default defineConfig({
  plugins: [react(), stampServiceWorker()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
