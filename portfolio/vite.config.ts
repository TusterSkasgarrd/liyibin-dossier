import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 平台部署会排除 dist/，构建输出到 www/
  build: { outDir: 'www' },
})
