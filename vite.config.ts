import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project site: https://<user>.github.io/<repo>/
const REPO_NAME = 'GlassFlow'

export default defineConfig(({ command }) => ({
  // Production builds must use the repo subpath; dev stays at /
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
  plugins: [react(), tailwindcss()],
}))