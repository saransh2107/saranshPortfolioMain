import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Connect, type Plugin } from 'vite'

// Serves the standalone Diwali page at /diwali in dev and preview (vercel.json does the same in production)
const rewriteDiwali: Connect.NextHandleFunction = (req, _res, next) => {
  if (req.url && /^\/diwali\/?(\?|$)/.test(req.url)) req.url = req.url.replace(/^\/diwali\/?/, '/diwali.html')
  next()
}
const diwaliRoute: Plugin = {
  name: 'diwali-route',
  configureServer: server => { server.middlewares.use(rewriteDiwali) },
  configurePreviewServer: server => { server.middlewares.use(rewriteDiwali) },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), diwaliRoute],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        diwali: fileURLToPath(new URL('./diwali.html', import.meta.url)),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react-vendor'
          if (id.includes('node_modules/react-router')) return 'router'
          if (id.includes('node_modules/framer-motion')) return 'motion'
        },
      },
    },
  },
})
