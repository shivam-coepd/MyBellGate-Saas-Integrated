import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    build({
      entry: 'src/index.tsx',
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx',
      // Let Vite handle these paths directly so React HMR works in dev
      exclude: [
        /^\/$/, // home
        /^\/product/,
        /^\/features/,
        /^\/security/,
        /^\/pricing/,
        /^\/about/,
        /^\/@.+/,       // Vite internal (/@vite, /@react-refresh, etc.)
        /^\/src\/.+/,   // source files
        /^\/node_modules\/.+/,
        /\.(ts|tsx|js|jsx|css|png|svg|ico|woff2?)(\?.*)?$/, // assets
      ],
    }),
  ],
})
