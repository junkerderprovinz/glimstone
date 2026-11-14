import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packages = fileURLToPath(new URL("../packages", import.meta.url));

// The Vue package's entries besides the index, as its package.json names them.
const { exports } = JSON.parse(readFileSync(`${packages}/vue/package.json`, "utf8")) as {
  exports: Record<string, { types: string }>;
};
const vueEntries = Object.entries(exports)
  .filter(([key]) => key !== ".")
  .map(([key, { types }]) => ({ name: key.slice(2), file: types.replace(/^\.\/dist\//, "").replace(/\.d\.ts$/, ".ts") }));

// The site runs on the packages' sources, so a change shows without building
// them first. The assets sit beside the core's sources, not in them.
const alias = [
  { find: /^@glimstone\/core\/(tokens\.css|tailwind-theme\.css|glyphs\.json)$/, replacement: `${packages}/core/$1` },
  { find: /^@glimstone\/(core|react|vue)$/, replacement: `${packages}/$1/src/index.ts` },
  { find: /^@glimstone\/(core|react)\/(.*)$/, replacement: `${packages}/$1/src/$2` },
  ...vueEntries.map(({ name, file }) => ({ find: `@glimstone/vue/${name}`, replacement: `${packages}/vue/src/${file}` })),
];

export default defineConfig({
  base: "./",
  plugins: [react(), vue(), tailwindcss()],
  resolve: { alias },
  // One page carries every demo, the machines and the font; splitting it buys nothing.
  build: { chunkSizeWarningLimit: 1600 },
  server: { fs: { allow: [".."] } },
});
