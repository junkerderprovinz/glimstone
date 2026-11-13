import { defineConfig, type Project } from "@playwright/test";

const port = 4318;

// One project per framework and browser: each runs every contract row against
// that framework's demos. The tests read the framework from the metadata, so a
// project name only has to be unique.
const frameworks = ["react", "vue"];
// A headless Firefox without a mouse reports no pointer and no hover, which
// turns on every touch-screen rule, so the pointer prefs give it a desktop's
// mouse. Firefox has no clipboard permission to grant, so the clipboard prefs
// let a test read back what was copied.
const firefox = {
  browserName: "firefox" as const,
  launchOptions: {
    firefoxUserPrefs: {
      "ui.primaryPointerCapabilities": 6,
      "ui.allPointerCapabilities": 6,
      "dom.events.asyncClipboard.readText": true,
      "dom.events.testing.asyncClipboard": true,
    },
  },
};
const contracts: Project[] = frameworks.flatMap((fw) => [
  { name: fw, metadata: { fw }, use: { browserName: "chromium" }, testIgnore: /(visual|a11y)\.spec/ },
  { name: `${fw}-firefox`, metadata: { fw }, use: firefox, testIgnore: /(visual|a11y)\.spec/ },
]);

export default defineConfig({
  testDir: "tests",
  workers: process.env.CI ? 2 : 4,
  timeout: 30_000,
  reporter: [["list"], ["json", { outputFile: "test-results/raw.json" }]],
  use: { baseURL: `http://localhost:${port}/`, viewport: { width: 1280, height: 860 } },
  // Baselines are rendered on Linux, where CI runs, so a run elsewhere compares
  // against nothing and writes its own copy beside them instead of failing.
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" } },
  projects: [
    ...contracts,
    { name: "visual", metadata: { fw: "react" }, use: { browserName: "chromium" }, testMatch: /visual\.spec/ },
    { name: "a11y", metadata: { fw: "react" }, use: { browserName: "chromium" }, testMatch: /a11y\.spec/ },
  ],
  webServer: { command: `npx vite preview --port ${port} --strictPort`, port, reuseExistingServer: !process.env.CI },
});
