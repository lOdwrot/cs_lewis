import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  const strapiTarget = env.STRAPI_URL || 'http://localhost:1337'

  const proxy = {
    '/api': { target: strapiTarget, changeOrigin: true },
    '/uploads': { target: strapiTarget, changeOrigin: true },
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    envDir: path.resolve(__dirname, '..'),
    server: { proxy },
    preview: { proxy, host: '0.0.0.0', port: process.env.PORT ? Number(process.env.PORT) : 4173 },
  }
})
