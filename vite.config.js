import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/dsy/',  // ← Match your Apache subdirectory path
  server: {
    port: 3000,
    open: true
  }
});
