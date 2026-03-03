import react from "@vitejs/plugin-react";
import { cpSync, existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Custom plugin to copy extension utils
const copyExtensionUtils = () => {
  return {
    name: "copy-extension-utils",
    writeBundle() {
      try {
        const sourceSkuPath = resolve(
          __dirname,
          "./public/models/vosk-model-small-en-us-0.15.zip",
        );
        const destSkuPath = resolve(
          __dirname,
          "./build/models/vosk-model-small-en-us-0.15.zip",
        );

        if (existsSync(sourceSkuPath)) {
          cpSync(sourceSkuPath, destSkuPath, { recursive: true });
        }

        console.log("✓ Copied extensionUtils.js to build/");
      } catch (error) {
        console.error("Failed to copy extensionUtils.js:", error);
      }
    },
  };
};

const emitRootIndexHtml = () => {
  return {
    name: "emit-root-index-html",
    writeBundle() {
      try {
        const builtIndexPath = resolve(__dirname, "./build/index.html");
        const rootIndexPath = resolve(__dirname, "./index.html");

        if (!existsSync(builtIndexPath)) return;

        const builtHtml = readFileSync(builtIndexPath, "utf-8");
        const rootHtml = builtHtml
          .replaceAll("./assets/", "./build/assets/")
          .replaceAll('"./extensionUtils.js"', '"./build/extensionUtils.js"');

        writeFileSync(rootIndexPath, rootHtml, "utf-8");
      } catch (error) {
        console.error("Failed to emit root index.html:", error);
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  envDir: ".",
  plugins: [react(), copyExtensionUtils(), emitRootIndexHtml()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
  },
  build: {
    minify: false,
    emptyOutDir: true,
    outDir: "../build/",
  },
  publicDir: "../public",
  base: "./",
});
