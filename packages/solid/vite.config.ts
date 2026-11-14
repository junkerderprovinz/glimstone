import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url));

// Every export besides the index is an entry: "./Select" builds dist/Select.js
// from src/Select.tsx.
const { exports } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  exports: Record<string, { types: string }>;
};
const entries = Object.fromEntries(
  Object.keys(exports)
    .filter((key) => key !== ".")
    .map((key) => [key.slice(2), src(`${key.slice(2)}.tsx`)]),
);

// A library build with every dependency left to the app. The Zag controls are
// entries of their own, so the main entry imports no Zag package.
export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: { index: src("index.ts"), ...entries },
      formats: ["es"],
    },
    rollupOptions: { external: [/^solid-js(\/|$)/, /^@zag-js\//, /^@internationalized\//, /^@glimstone\//] },
    emptyOutDir: true,
  },
});
