import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxying /api to the Express server during dev means the frontend never needs
// to know the backend's port/host explicitly, and avoids CORS entirely in local dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});
