import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import solid from "vite-plugin-solid";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const packages = fileURLToPath(new URL("../packages", import.meta.url));
const solidFiles = /\/(packages\/solid\/src|site\/src\/(solid|solid-demos))\/.*\.tsx$/;

// The site runs on the packages' sources, so a change shows without building
// them first. The assets sit beside the core's sources, not in them.
const alias = [
  { find: /^@glimstone\/core\/(tokens\.css|tailwind-theme\.css|glyphs\.json)$/, replacement: `${packages}/core/$1` },
  { find: /^@glimstone\/(core|react|vue|solid|svelte)$/, replacement: `${packages}/$1/src/index.ts` },
  { find: /^@glimstone\/(core|react)\/(.*)$/, replacement: `${packages}/$1/src/$2` },
  ...["Select", "Combobox", "Slider"].map((name) => ({
    find: `@glimstone/vue/${name}`,
    replacement: `${packages}/vue/src/entries/${name.toLowerCase()}.ts`,
  })),
  ...["Select", "Combobox", "Slider"].map((name) => ({ find: `@glimstone/solid/${name}`, replacement: `${packages}/solid/src/${name}.tsx` })),
  ...["Select", "Combobox", "Slider"].map((name) => ({
    find: `@glimstone/svelte/${name}`,
    replacement: `${packages}/svelte/src/entries/${name.toLowerCase()}.ts`,
  })),
];

export default defineConfig({
  base: "./",
  // React and Solid both write JSX in .tsx files, so each takes its own folders.
  plugins: [react({ exclude: [solidFiles, /\/node_modules\//] }), solid({ include: solidFiles }), vue(), svelte(), tailwindcss()],
  resolve: { alias },
  // One page carries every demo, the machines and the font; splitting it buys nothing.
  build: { chunkSizeWarningLimit: 1600 },
  server: { fs: { allow: [".."] } },
});
