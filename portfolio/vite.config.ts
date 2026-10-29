import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 平台部署会排除 dist/，构建输出到 www/
  build: { outDir: 'www' },
  // GitHub Pages 部署在子路径 /liyibin-dossier/，WorkBuddy 用根路径 /
  base: process.env.BASE_PATH || '/',
})
