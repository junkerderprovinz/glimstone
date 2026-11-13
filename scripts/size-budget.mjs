// Measures what an app pays for GlimStone, packed as a server sends it, and
// fails when a file grows past its limit in scripts/size-budget.json. The
// packages are bundled and minified with their dependencies left out, so the
// figure is GlimStone's own code; the plugin bundle is measured whole, as a
// plugin page loads it. In CI the table also goes into the job summary.
// Every package with a src/index.ts is measured, so a new framework package
// fails here until size-budget.json gives it a limit.
//
// A limit is raised by editing size-budget.json in the commit that needs it,
// with the reason in the commit message ("Packages" in the design language).
//
// Run: node scripts/size-budget.mjs
import { appendFileSync, existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const root = fileURLToPath(new URL("..", import.meta.url));

/** The gzip and brotli sizes of a text, at the levels a server uses for static files. */
export function packed(text) {
  const raw = Buffer.from(text);
  return {
    gzip: gzipSync(raw, { level: 9 }).length,
    brotli: brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
  };
}

/** One line per measured file, and the reason it fails if it is over its limit or has none. */
export function compare(measured, budget) {
  return Object.entries(measured).map(([name, size]) => {
    const limit = budget[name];
    const over = limit ? ["gzip", "brotli"].filter((k) => size[k] > limit[k]) : [];
    const problem = !limit ? "has no limit in size-budget.json" : over.length ? `is over its ${over.join(" and ")} limit` : "";
    return { name, size, limit, problem };
  });
}

const kb = (n) => (n / 1024).toFixed(1);

export function table(rows) {
  const lines = ["| File | gzip | brotli | limit (gzip / brotli) |", "|---|---:|---:|---:|"];
  for (const { name, size, limit, problem } of rows) {
    const cap = limit ? `${kb(limit.gzip)} / ${kb(limit.brotli)} KiB` : "none";
    lines.push(`| ${problem ? "**" + name + "**" : name} | ${kb(size.gzip)} KiB | ${kb(size.brotli)} KiB | ${cap} |`);
  }
  return lines.join("\n");
}

async function bundle(entry, plugins = []) {
  const { build } = await import("vite");
  const out = mkdtempSync(join(tmpdir(), "gs-size-"));
  await build({
    configFile: false,
    logLevel: "silent",
    plugins,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
      outDir: out,
      minify: true,
      lib: { entry: join(root, entry), formats: ["es"], fileName: () => "bundle.js" },
      rollupOptions: { external: (id) => !id.startsWith(".") && !id.startsWith("/") && !/^[a-zA-Z]:[\\/]/.test(id) && !id.startsWith("\0") },
    },
  });
  return readdirSync(out)
    .filter((f) => f.endsWith(".js"))
    .map((f) => readFileSync(join(out, f), "utf8"))
    .join("");
}

// The Vite plugin a framework package's sources need, by package name. A
// package not named here is plain TypeScript.
const PLUGINS = {
  "@glimstone/vue": ["@vitejs/plugin-vue", "default"],
  "@glimstone/svelte": ["@sveltejs/vite-plugin-svelte", "svelte"],
  "@glimstone/solid": ["vite-plugin-solid", "default"],
};

/** Every package with a src/index.ts, with its npm name. */
function packages() {
  return readdirSync(join(root, "packages"), { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(root, "packages", d.name, "src/index.ts")))
    .map((d) => ({ name: JSON.parse(readFileSync(join(root, "packages", d.name, "package.json"), "utf8")).name, entry: `packages/${d.name}/src/index.ts` }));
}

export async function measure() {
  const { execFileSync } = await import("node:child_process");
  const plugin = mkdtempSync(join(tmpdir(), "gs-plugin-"));
  execFileSync(process.execPath, [join(root, "scripts/build-plugin-bundle.mjs"), plugin], { stdio: "ignore" });
  const file = (p) => readFileSync(join(root, p), "utf8");
  const sizes = {
    "tokens.css": packed(file("packages/core/tokens.css")),
    "tailwind-theme.css": packed(file("packages/core/tailwind-theme.css")),
  };
  for (const { name, entry } of packages()) {
    const [module, exported] = PLUGINS[name] ?? [];
    const plugins = module ? [(await import(module))[exported]()] : [];
    sizes[name] = packed(await bundle(entry, plugins));
  }
  sizes["plugin glimstone.js"] = packed(readFileSync(join(plugin, "glimstone.js"), "utf8"));
  sizes["plugin fortress-card.js"] = packed(readFileSync(join(plugin, "fortress-card.js"), "utf8"));
  return sizes;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const budget = JSON.parse(readFileSync(join(root, "scripts/size-budget.json"), "utf8"));
  const rows = compare(await measure(), budget);
  const report = table(rows);
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Size budget\n\n${report}\n`);
  const failed = rows.filter((r) => r.problem);
  for (const r of failed) console.error(`${r.name} ${r.problem}.`);
  process.exit(failed.length ? 1 : 0);
}
