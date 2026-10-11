import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite does not read PORT on its own. Honouring it lets the launcher place the
// dev server on a free port when the default is already taken.
const port = process.env.PORT ? Number(process.env.PORT) : undefined

// GitHub Pages serves a project site from /<repo>/, while Vercel and local dev
// serve from the root. The deploy workflow sets VITE_BASE accordingly.
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    port,
    // When a port was assigned, fail loudly instead of silently drifting to
    // another one the preview would not be watching.
    strictPort: port !== undefined,
  },
})
