import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const ReactCompilerConfig = {
  target: "18",
};

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routeTreeFileHeader: [
        "/* eslint-disable eslint-comments/no-unlimited-disable */",
        "/* eslint-disable */",
      ],
      generatedRouteTree: "./src/route-tree.gen.ts",
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
      },
    }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/**/*"],
      manifest: {
        name: "¿Dónde está el Subte?",
        short_name: "Subte BA",
        description: "Consulta arribos en tiempo real del subterráneo de Buenos Aires",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/apitransporte\.buenosaires\.gob\.ar\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "gcba-api-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["react-compiler-runtime"],
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {},
  },
});
