import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: fileURLToPath(new URL('../../', import.meta.url)),
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: 'localhost', port: 5175, strictPort: true, proxy: { '/api': 'http://127.0.0.1:4000' } },
  preview: { host: 'localhost', port: 5175, strictPort: true, proxy: { '/api': 'http://127.0.0.1:4000' } },
});
