// Builds the bundle a page without a build step includes, such as an Unraid
// plugin's PHP page: the core as one script with a global and as a module, the
// stylesheet, the fortress card and the glyphs. The release workflow zips the
// folder and attaches it to the GitHub release.
//
// Run: node scripts/build-plugin-bundle.mjs [out]   (default dist/glimstone-plugin)
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const core = join(root, "packages/core");
const out = resolve(process.argv[2] ?? join(root, "dist/glimstone-plugin"));
const { version } = JSON.parse(readFileSync(join(core, "package.json"), "utf8"));

rmSync(out, { recursive: true, force: true });
await build({
  configFile: false,
  logLevel: "warn",
  // Zag reads it to decide on its warnings, and a browser has no process.
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: out,
    emptyOutDir: false,
    lib: {
      entry: join(core, "src/index.ts"),
      name: "GlimStone",
      formats: ["iife", "es"],
      fileName: (format) => (format === "iife" ? "glimstone.js" : "glimstone.mjs"),
    },
  },
});

mkdirSync(out, { recursive: true });
for (const [from, to] of [
  ["tokens.css", "tokens.css"],
  ["glyphs.json", "glyphs.json"],
  ["vanilla/fortress-card.js", "fortress-card.js"],
  ["vanilla/fortress-card.css", "fortress-card.css"],
]) {
  copyFileSync(join(core, from), join(out, to));
}
copyFileSync(join(root, "LICENSE"), join(out, "LICENSE"));

writeFileSync(
  join(out, "README.txt"),
  `GlimStone ${version} for pages without a build step

Copy this folder into the plugin, for example as include/glimstone/, and load
the stylesheet before the page's own:

  <link rel="stylesheet" href="include/glimstone/tokens.css">
  <script src="include/glimstone/glimstone.js"></script>
  <script>
    GlimStone.applyCachedAppearance();
    GlimStone.wireTooltips();
  </script>

glimstone.js puts the core on window.GlimStone: wireTooltips() and infoIcon()
for hover names and the (i), mountSelect() for the select, attachNumberSteppers()
for a number field, enableSelectScroll() for a plain <select> and the appearance
engine. glimstone.mjs is the same code as a module, for <script type="module">.

The fortress card is fortress-card.js with fortress-card.css; call
GlimFortressCard.mount(element, adapter, options) as the design language
describes. glyphs.json holds every glyph as SVG.

https://github.com/junkerderprovinz/glimstone/blob/v${version}/docs/design-language.md
`,
);
console.log(`plugin bundle ${version} in ${out}`);
