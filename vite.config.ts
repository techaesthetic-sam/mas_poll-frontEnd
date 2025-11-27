import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 5173, // Vite default port as per project documentation
      proxy: {
        // Poll Service (Port 8001)
        '/polls': {
          target: env.VITE_POLL_SERVICE_URL || 'http://localhost:8001',
          changeOrigin: true,
          secure: false,
        },
        // Option Service (Port 8002)
        '/options': {
          target: env.VITE_OPTION_SERVICE_URL || 'http://localhost:8002',
          changeOrigin: true,
          secure: false,
        },
        // Vote Service (Port 8003)
        '/vote': {
          target: env.VITE_VOTE_SERVICE_URL || 'http://localhost:8003',
          changeOrigin: true,
          secure: false,
        },
        '/analytics': {
          target: env.VITE_VOTE_SERVICE_URL || 'http://localhost:8003',
          changeOrigin: true,
          secure: false,
        },
      }
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
