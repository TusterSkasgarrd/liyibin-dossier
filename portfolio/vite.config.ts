import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 平台部署会排除 dist/，构建输出到 www/
  build: {
    outDir: 'www',
    // 双入口：前台 index.html + 后台 admin.html。
    // GitHub Pages 没有 SPA 回退，/admin 必须有实体 html 文件才能访问
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
      },
    },
  },
  // GitHub Pages 部署在子路径 /liyibin-dossier/，WorkBuddy 用根路径 /
  base: process.env.BASE_PATH || '/',
  server: {
    // 开发模式把 /api 转发到本地后端（npm start 默认 3001），
    // 否则前后端断连：后台保存落 localStorage、前台读种子，永远对不上
    proxy: {
      '/api': {
        target: process.env.API_PROXY || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
