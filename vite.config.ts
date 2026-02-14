import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

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
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "chunks/[name].[hash].js",
        entryFileNames: "entries/[name].[hash].js",
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "@pages": "/src/pages",
      "@components": "/src/components",
      "@hooks": "/src/hooks",
      "@shared": "/src/shared",
      "@assets": "/src/assets",
      "@design": "/design",
      "@styles": "/styles",
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  server: {
    proxy: {
      "/api": {
        // Удаленный dev-стенд
        target: "https://termeet.tech",
        changeOrigin: true,
        secure: true,

        configure: proxy => {
          proxy.on("error", err => {
            console.log("❌ Proxy error:", err);
          });

          proxy.on("proxyReq", (_, req) => {
            console.log(`🚀 Sending Request to ${"http://91.197.97.8"}:`, req.method, req.url);
          });

          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("✅ Received Response:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
    cors: true,
    port: 8080,
    open: true,
  },
});
