import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url));

// Every export besides the index is an entry: "./Select" builds dist/Select.js
// from the file its types come from, src/entries/select.ts.
const { exports } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  exports: Record<string, { types: string }>;
};
const entries = Object.fromEntries(
  Object.entries(exports)
    .filter(([key]) => key !== ".")
    .map(([key, { types }]) => [key.slice(2), src(types.replace(/^\.\/dist\//, "").replace(/\.d\.ts$/, ".ts"))]),
);

// A library build with every dependency left to the app. The Zag controls are
// entries of their own, so the main entry imports no Zag package.
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: { index: src("index.ts"), ...entries },
      formats: ["es"],
    },
    rollupOptions: { external: [/^vue$/, /^@zag-js\//, /^@internationalized\//, /^@glimstone\//] },
    emptyOutDir: true,
  },
});
