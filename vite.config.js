import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/canvas-api": {
          target: env.CANVAS_BASE_URL || "https://lms.handong.edu",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/canvas-api/, "/api/v1"),
          headers: env.CANVAS_API_TOKEN
            ? { Authorization: `Bearer ${env.CANVAS_API_TOKEN}` }
            : {},
        },
      },
    },
  };
});