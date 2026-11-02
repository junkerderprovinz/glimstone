import { defineConfig } from "@playwright/test";

const port = 4318;

// One project per framework: each runs every contract row against that
// framework's demos.
export default defineConfig({
  testDir: "tests",
  workers: process.env.CI ? 2 : 4,
  timeout: 30_000,
  reporter: [["list"], ["json", { outputFile: "test-results/raw.json" }]],
  use: { browserName: "chromium", baseURL: `http://localhost:${port}/`, viewport: { width: 1280, height: 860 } },
  projects: [{ name: "react" }, { name: "vue" }],
  webServer: { command: `npx vite preview --port ${port} --strictPort`, port, reuseExistingServer: !process.env.CI },
});
