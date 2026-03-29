import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3010,
    proxy: {
      '/api': {
        target: 'https://4shh3k1g.run.complete.dev',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3010,
    allowedHosts: ['zi6pqk4q.run.complete.dev', 'all'],
  },
})
