import path from "path"; // Добавьте импорт path
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: "default",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "chunks/[name].[hash].js",
        entryFileNames: "entries/[name].[hash].js",
        manualChunks: {
          "react": ["react"],
          "react-dom": ["react-dom"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@app": path.resolve(__dirname, "src/app"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@entities": path.resolve(__dirname, "src/entities"),
      "@features": path.resolve(__dirname, "src/features"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@widgets": path.resolve(__dirname, "src/widgets"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  server: {
    proxy: {
      "/api": {
        target: "https://backend.termeet-dev.ru",
        changeOrigin: true,
        // Важно: не переписываем путь
        rewrite: path => path,
        secure: true,
        configure: proxy => {
          proxy.on("error", err => {
            console.log("❌ Proxy error:", err);
          });
          proxy.on("proxyReq", (_, req) => {
            console.log(`🚀 Sending Request:`, req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("✅ Received Response:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
    cors: true,
    port: 5173,
    open: true,
  },
});
