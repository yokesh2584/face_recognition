import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000, // Frontend runs on port 9000
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Backend port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // Fix API calls
      },
    },
  },
});
