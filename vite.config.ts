import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'gh-pages') {
    return {
      plugins: [react()],
      base: '/ice-server-test/',
    };
  }
  return {
    plugins: [react()],
  };
});
