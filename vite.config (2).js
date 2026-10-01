import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' = path aset relatif, jadi build bisa jalan di GitHub Pages
// (https://USERNAME.github.io/NAMA-REPO/) maupun Vercel tanpa perlu menulis nama repo.
export default defineConfig({
  base: './',
  plugins: [react()],
})
