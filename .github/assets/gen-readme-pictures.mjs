/**
 * Draws the README's pictures from the real components: the component strip,
 * the four engine tiles, the glossary window and the easter eggs, each in a
 * light and a dark variant for a <picture>.
 *
 * readme-stage.tsx lays out every scene on the site's own Vite config and
 * styles, so a change to a component or a token shows up on the next run.
 * The headings use the house's store fonts, Bree Serif and Lato, fetched to
 * the OS temp dir.
 *
 * Needs the repo's dependencies (npm ci) and Playwright's Chromium.
 * Run: node .github/assets/gen-readme-pictures.mjs [name ...]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createServer } from "vite";
import { chromium } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const SITE = join(REPO, "site");
const OUT = join(HERE, "pictures");
const STAGE = join(HERE, "readme-stage.tsx").replaceAll("\\", "/");

const ENGINES = ["shape", "colour", "motion", "label"];
const PICTURES = [
  { name: "components", scene: "strip", size: [1920, 800] },
  ...ENGINES.map((engine) => ({ name: `engine-${engine}`, scene: "tile", engine, size: [600, 860] })),
  { name: "glossary", scene: "glossary", size: [1920, 900], entry: "button" },
  { name: "easter-eggs", scene: "eggs", size: [1920, 760] },
];
const wanted = process.argv.slice(2);

async function cached(file, url) {
  const path = join(tmpdir(), `glimstone-readme-${file}`);
  if (!existsSync(path)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${file}: fetch ${res.status}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
  }
  return readFileSync(path);
}
const dataUrl = (buf, type) => `data:${type};base64,${buf.toString("base64")}`;
const fonts = "https://github.com/google/fonts/raw/main/ofl";
const FONT_CSS = `
@font-face { font-family: "Bree Serif"; src: url(${dataUrl(await cached("BreeSerif-Regular.ttf", `${fonts}/breeserif/BreeSerif-Regular.ttf`), "font/ttf")}); }
@font-face { font-family: Lato; src: url(${dataUrl(await cached("Lato-Regular.ttf", `${fonts}/lato/Lato-Regular.ttf`), "font/ttf")}); }`;

// The site's tokens and props are generated; a fresh clone has none yet.
execFileSync(process.execPath, ["gen.mjs"], { cwd: SITE, stdio: "ignore" });

const stagePage = {
  name: "readme-stage",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url.startsWith("/readme-stage.html")) return next();
      const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/@fs/${STAGE}"></script></body></html>`;
      res.setHeader("Content-Type", "text/html");
      res.end(await server.transformIndexHtml(req.url, html));
    });
  },
};
const server = await createServer({
  root: SITE,
  configFile: join(SITE, "vite.config.ts"),
  plugins: [stagePage],
  server: { port: 4380, strictPort: false, watch: null },
  logLevel: "warn",
});
await server.listen();
const base = server.resolvedUrls.local[0];

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });

async function shoot({ scene, engine, entry, size: [width, height] }, theme) {
  const params = new URLSearchParams({ scene, theme });
  if (engine) params.set("engine", engine);
  if (entry) params.set("entry", entry);
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: theme });
  const page = await context.newPage();
  await page.goto(`${base}readme-stage.html?${params}`, { timeout: 180_000 });
  await page.addStyleTag({ content: FONT_CSS });
  await page.waitForLoadState("networkidle", { timeout: 180_000 });
  if (scene === "glossary") await page.waitForSelector("iframe[data-ready]", { timeout: 60_000 });
  if (scene === "strip") await page.hover(".rs-with-tip .glim-info-icon");
  await page.evaluate(() => document.fonts.ready);
  // The toast and the cells enter on the motion engine's curve; let them land.
  await page.waitForTimeout(900);
  const png = await page.screenshot();
  await context.close();

  // Drawn at twice the size and scaled down, which keeps the type crisp.
  const small = await browser.newPage({ viewport: { width, height } });
  await small.setContent(`<body style="margin:0"><img src="${dataUrl(png, "image/png")}" style="display:block;width:${width}px;height:${height}px">`);
  await small.locator("img").evaluate((img) => img.decode());
  const out = await small.screenshot();
  await small.close();
  return out;
}

try {
  for (const picture of PICTURES) {
    if (wanted.length && !wanted.includes(picture.name)) continue;
    for (const theme of ["light", "dark"]) {
      const file = `${picture.name}${theme === "dark" ? "-dark" : ""}.png`;
      writeFileSync(join(OUT, file), await shoot(picture, theme));
      console.log(`${file} written`);
    }
  }
} finally {
  await browser.close();
  await server.close();
}
