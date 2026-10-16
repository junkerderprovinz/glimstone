import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const reference = fileURLToPath(new URL("../reference", import.meta.url));
const local = (p: string) => fileURLToPath(new URL(`./node_modules/${p}`, import.meta.url));

// The reference files sit outside this folder, where walking up finds no
// node_modules, so their bare imports resolve to the site's own copies.
const fromSite = ["react-dom", "react", "@zag-js"].flatMap((pkg) => {
  const name = pkg.replace("/", "\\/");
  return [
    { find: new RegExp(`^${name}/(.*)$`), replacement: local(`${pkg}/$1`) },
    { find: new RegExp(`^${name}$`), replacement: local(pkg) },
  ];
});

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: { alias: [{ find: "@gs", replacement: reference }, ...fromSite] },
  // One page carries every demo, the machines and the font; splitting it buys nothing.
  build: { chunkSizeWarningLimit: 1600 },
  server: { fs: { allow: [".", reference, fileURLToPath(new URL("../.github/assets", import.meta.url))] } },
});
