import react from '@vitejs/plugin-react';
import child_process from 'child_process';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const commitHash = child_process
  .execSync('git rev-parse --short HEAD')
  .toString();
// https://vitejs.dev/config/
export default defineConfig(async () => ({
  define: { 'import.meta.env.COMMIT_HASH': JSON.stringify(commitHash) },
  plugins: [react(), tsconfigPaths()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 3000,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
}));
