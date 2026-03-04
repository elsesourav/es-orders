import react from "@vitejs/plugin-react";
import { cpSync, existsSync, rmSync } from "fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
const __dirname = dirname(fileURLToPath(import.meta.url));

const publishRootOutput = () => {
  return {
    name: "publish-root-output",
    writeBundle() {
      try {
        const tempDir = resolve(__dirname, "./.build-temp");
        const tempIndexPath = resolve(tempDir, "./index.html");
        const tempAssetsPath = resolve(tempDir, "./assets");
        const tempModelsPath = resolve(tempDir, "./models");
        const rootIndexPath = resolve(__dirname, "./index.html");
        const rootAssetsPath = resolve(__dirname, "./assets");
        const rootModelsPath = resolve(__dirname, "./models");

        if (existsSync(tempIndexPath)) {
          cpSync(tempIndexPath, rootIndexPath, { recursive: true });
        }

        rmSync(rootAssetsPath, { recursive: true, force: true });
        if (existsSync(tempAssetsPath)) {
          cpSync(tempAssetsPath, rootAssetsPath, { recursive: true });
        }

        rmSync(rootModelsPath, { recursive: true, force: true });
        if (existsSync(tempModelsPath)) {
          cpSync(tempModelsPath, rootModelsPath, { recursive: true });
        }

        rmSync(tempDir, { recursive: true, force: true });

        console.log("✓ Published root index.html + assets/");
      } catch (error) {
        console.error("Failed to publish root output:", error);
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  envDir: ".",
  plugins: [react(), publishRootOutput()],
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
    outDir: "../.build-temp",
  },
  publicDir: "../public",
  base: "./",
});
