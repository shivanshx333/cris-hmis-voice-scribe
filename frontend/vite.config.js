import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build base path is the GitHub Pages repo name.
// During local `npm run dev`, base is '/'.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/cris-hmis-voice-scribe/' : '/',
  server: {
    port: 5173,
  },
}))
