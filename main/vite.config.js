import react from "@vitejs/plugin-react";
import { cpSync, existsSync } from "fs";
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
            const sourceSkuPath = resolve(__dirname, "src/assets/sku");
            const destSkuPath = resolve(__dirname, "dist/assets/sku");

            if (existsSync(sourceSkuPath)) {
               cpSync(sourceSkuPath, destSkuPath, { recursive: true });
            }

            console.log("✓ Copied extensionUtils.js to dist/");
         } catch (error) {
            console.error("Failed to copy extensionUtils.js:", error);
         }
      },
   };
};

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react(), copyExtensionUtils()],
   resolve: {
      alias: {
         "@": resolve(__dirname, "./src"),
      },
   },
   build: {
      minify: false,
      outDir: "./dist",
   },
   publicDir: "public",
   base: "./",
});
