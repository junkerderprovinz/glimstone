import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const packages = fileURLToPath(new URL("../packages", import.meta.url));

// The site runs on the packages' sources, so a change shows without building
// them first. The assets sit beside the core's sources, not in them.
const alias = [
  { find: /^@glimstone\/core\/(tokens\.css|tailwind-theme\.css|glyphs\.json)$/, replacement: `${packages}/core/$1` },
  { find: /^@glimstone\/(core|react)$/, replacement: `${packages}/$1/src/index.ts` },
  { find: /^@glimstone\/(core|react)\/(.*)$/, replacement: `${packages}/$1/src/$2` },
];

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: { alias },
  // One page carries every demo, the machines and the font; splitting it buys nothing.
  build: { chunkSizeWarningLimit: 1600 },
  server: { fs: { allow: [".."] } },
});
