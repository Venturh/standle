import path from "path";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

// See https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "@vueuse/core"],
      dts: "./src/auto-imports.d.ts",
      eslintrc: {
        enabled: true,
        filepath: resolve(__dirname, ".eslintrc-auto-import.json"),
      },
    }),
    Components({
      dirs: ["./src/components"],
      dts: true,
      directoryAsNamespace: true,
    }),
  ],
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_"],
  server: {
    port: 1420,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "./dist",
    // See https://tauri.app/v1/references/webview-versions for details
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari15",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    emptyOutDir: true,
  },
});
