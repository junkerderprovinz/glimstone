import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { fileURLToPath } from "node:url";

const src = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url));

// A library build with every dependency left to the app. The Zag controls are
// entries of their own, so the main entry imports no Zag package.
export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: { index: src("index.ts"), Select: src("Select.tsx"), Combobox: src("Combobox.tsx"), Slider: src("Slider.tsx") },
      formats: ["es"],
    },
    rollupOptions: { external: [/^solid-js(\/|$)/, /^@zag-js\//, /^@glimstone\//] },
    emptyOutDir: true,
  },
});
