import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const src = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url));

// A library build with every dependency left to the app. The Zag controls are
// entries of their own, so the main entry imports no Zag package.
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: { index: src("index.ts"), Select: src("entries/select.ts"), Combobox: src("entries/combobox.ts"), Slider: src("entries/slider.ts") },
      formats: ["es"],
    },
    rollupOptions: { external: [/^vue$/, /^@zag-js\//, /^@glimstone\//] },
    emptyOutDir: true,
  },
});
