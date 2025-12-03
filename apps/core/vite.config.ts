import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "core",
      remotes: {
        accounts: {
          type: "module",
          name: "accounts",
          entry: "http://localhost:5174/remoteEntry.js",
          entryGlobalName: "accounts",
          shareScope: "default",
        },
        events: {
          type: "module",
          name: "events",
          entry: "http://localhost:5175/remoteEntry.js",
          entryGlobalName: "events",
          shareScope: "default",
        },
        vault: {
          type: "module",
          name: "vault",
          entry: "http://localhost:5176/remoteEntry.js",
          entryGlobalName: "vault",
          shareScope: "default",
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    cors: true,
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
  },
});