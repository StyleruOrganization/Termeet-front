import path from "path"; // Добавьте импорт path
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: "default",
        ref: true,
        svgo: true, // Включаем SVGO для оптимизации SVG
        titleProp: true,
      },
      include: "**/*.svg",
    }),
    mode === "production" &&
      viteCompression({
        algorithm: "gzip",
        threshold: 128,
      }),
    mode === "production" &&
      viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 128,
      }),
    mode === "analyze" &&
      visualizer({
        open: true,
        filename: "dist/stats.html",
      }),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),
  ],
  build: {
    minify: "oxc",
    cssMinify: "lightningcss",
    sourcemap: false,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    rolldownOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "chunks/[name].[hash].js",
        entryFileNames: "entries/[name].[hash].js",
        minify: {
          compress: {
            dropConsole: true,
            dropDebugger: true,
          },
        },
        manualChunks: id => {
          // Разделяем страницы по отдельным чанкам
          if (id.includes("/pages/Entry")) {
            return "page-entry";
          }
          if (id.includes("/pages/CreateMeet")) {
            return "page-create-meet";
          }
          if (id.includes("/pages/Meet")) {
            return "page-meet";
          }
          if (id.includes("/pages/EditMeet")) {
            return "page-edit-meet";
          }
          if (id.includes("/pages/Stub")) {
            return "page-stub";
          }

          // Библиотеки выделяем в отдельные чанки
          if (id.includes("node_modules")) {
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            if (id.includes("react")) {
              return "vendor-react";
            }
          }
          return "vendor";
        },
      },
    },
    // Размер для предупреждения о больших чанках
    chunkSizeWarningLimit: 1000, // kB

    // Очищаем выходную директорию
    emptyOutDir: true,
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
    tsconfigPaths: true,
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
}));
