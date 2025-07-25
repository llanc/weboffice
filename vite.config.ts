import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { defineConfig } from 'vite';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export default defineConfig({
  base: '/document',
  publicDir: 'public',
  resolve: {
    alias: {
      '@/lib': resolve(__dirname, 'lib'),
      '@/store': resolve(__dirname, 'store'),
      '@/assets': resolve(__dirname, 'assets'),
      '@/types': resolve(__dirname, 'types'),
      '@/styles': resolve(__dirname, 'styles'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/base.css";`,
      },
    },
  },
  build: {
    rollupOptions: {
      // 在构建完成后执行清理
      plugins: [
        {
          name: 'remove-wasm-files',
          writeBundle() {
            try {
              // 查找并删除指定的 WASM 文件
              const filesToRemove = [
                'dist/**/x2t.wasm.br',
                'dist/**/x2t.wasm.gz',
                'dist/**/x2t.wasm'
              ];

              filesToRemove.forEach(pattern => {
                const files = glob.sync(pattern);
                files.forEach(file => {
                  if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                    console.log(`已删除文件: ${file}`);
                  }
                });
              });
            } catch (error) {
              console.warn('删除 WASM 文件时出错:', error);
            }
          }
        }
      ]
    }
  }
});
