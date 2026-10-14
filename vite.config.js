import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// En GitHub Pages la app vive en /sabores-del-peru/; en local sigue en /
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/sabores-del-peru/' : '/',
}))
