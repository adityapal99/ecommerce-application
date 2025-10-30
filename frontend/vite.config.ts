import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080", // nginx
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler"],
        ],
      },
    }),
  ],
});
