import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { federation } from "@module-federation/vite";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "events",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App.tsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  server: {
    port: 5175,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  optimizeDeps: {
    exclude: ["@originjs/vite-plugin-federation"],
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: true,
    assetsInlineLimit: 0,
    modulePreload: {
      polyfill: false,
    },
  },
});