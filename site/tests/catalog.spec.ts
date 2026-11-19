import { expect, test, type Page } from "@playwright/test";
import { MCP_PROVIDERS } from "../../packages/core/src/mcpProviders.ts";
import { REGISTRY_PROVIDERS } from "../../packages/core/src/registryProviders.ts";
import { CAPTCHA_PROVIDERS } from "../../packages/core/src/captchaProviders.ts";
import { DOWNLOAD_PROVIDERS } from "../../packages/core/src/downloadProviders.ts";
import { IDENTITY_PROVIDERS } from "../../packages/core/src/identityProviders.ts";
import { STORAGE_PROVIDERS } from "../../packages/core/src/storageProviders.ts";
import { TRANSFER_PROVIDERS } from "../../packages/core/src/transferProviders.ts";
import { VPN_PROVIDERS } from "../../packages/core/src/vpnProviders.ts";
import { open, stage } from "./page";

// Scoped by the component's own attribute: in Firefox, evaluateAll under a
// dialog found by its name can take the page down.
const picker = (page: Page) => page.locator('[data-glim="PickerWindow"]');
const search = (page: Page) => picker(page).getByRole("searchbox", { name: "Search providers" });
const names = (page: Page) =>
  picker(page)
    .locator(".glim-provider-pick button.glim-readme-btn")
    .evaluateAll((all) => all.map((b) => b.getAttribute("aria-label")));

async function show(page: Page) {
  await open(page, "/components/picker-window");
  await stage(page, "PickerWindowStorage").getByRole("button", { name: "Add storage" }).click();
  await expect(search(page)).toBeFocused();
}

test.describe("A catalog in a PickerWindow", () => {
  test("[catalog-groups] every provider stands in its group, the groups in the catalog's order, each alphabetical", async ({ page }) => {
    await show(page);
    const sections = await picker(page)
      .locator(".glim-pick-section")
      .evaluateAll((all) =>
        all.map((s) => ({
          title: s.querySelector(".glim-eyebrow")?.textContent,
          count: s.querySelectorAll("button.glim-readme-btn").length,
          names: [...s.querySelectorAll("button.glim-readme-btn")].map((b) => b.getAttribute("aria-label") ?? ""),
        })),
      );
    const count = (group: string) => STORAGE_PROVIDERS.entries.filter((e) => e.group === group).length;
    expect(sections.map(({ title, count }) => ({ title, count }))).toEqual([
      { title: "Clouds", count: count("cloud") },
      { title: "Object storage", count: count("storage") },
      { title: "Servers and shares", count: count("protocol") },
      { title: "On another target", count: count("layered") },
    ]);
    for (const { names } of sections) {
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
    }
  });

  test("[catalog-marks] every tile carries a mark, a brand's lit in its colour and a glyph's in the accent", async ({ page }) => {
    await show(page);
    const tiles = picker(page).locator(".glim-provider-pick button.glim-readme-btn");
    await expect(tiles).toHaveCount(STORAGE_PROVIDERS.entries.length);
    await expect(picker(page).locator(".glim-provider-pick button.glim-readme-btn .glim-readme-btn-mark:has(svg)")).toHaveCount(
      STORAGE_PROVIDERS.entries.length,
    );
    const fill = async (name: string) => {
      const tile = picker(page).getByRole("button", { name, exact: true });
      await tile.scrollIntoViewIfNeeded();
      await tile.hover();
      return tile.evaluate((b) => getComputedStyle(b).backgroundColor);
    };
    expect(await fill("Backblaze B2")).toBe("rgb(226, 30, 41)");
    expect(await fill("OpenCloud")).toBe("rgb(32, 67, 79)");
    const accent = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--accent)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });
    expect(await fill("WebDAV")).toBe(accent);
  });

  test("[catalog-search] the search finds providers by their own words across groups, and a kind stands as the second line", async ({ page }) => {
    await show(page);
    await search(page).fill("webdav");
    await expect.poll(() => names(page)).toEqual(["Nextcloud", "OpenCloud", "ownCloud", "OxiCloud", "WebDAV"]);
    await search(page).fill("windows");
    await expect.poll(() => names(page)).toEqual(["SMB Windows share"]);
  });

  test("[catalog-pick] a pick closes the window and hands back the provider's id", async ({ page }) => {
    await show(page);
    await search(page).fill("garage");
    await search(page).press("Enter");
    await expect(picker(page)).toHaveCount(0);
    await expect(stage(page, "PickerWindowStorage").locator("output")).toHaveText("Picked: Garage");
  });
});

const sections = (page: Page) =>
  picker(page)
    .locator(".glim-pick-section")
    .evaluateAll((all) =>
      all.map((s) => ({
        title: s.querySelector(".glim-eyebrow")?.textContent,
        names: [...s.querySelectorAll("button.glim-readme-btn")].map((b) => b.getAttribute("aria-label") ?? ""),
      })),
    );

async function showOther(page: Page, demo: string, button: string, searchName: string) {
  await open(page, "/components/picker-window");
  await stage(page, demo).getByRole("button", { name: button }).click();
  await expect(picker(page).getByRole("searchbox", { name: searchName })).toBeFocused();
  return picker(page).getByRole("searchbox", { name: searchName });
}

test.describe("The MCP catalog in a PickerWindow", () => {
  const show = (page: Page) => showOther(page, "PickerWindowMcpClients", "Connect a client", "Search clients");

  test("[mcp-groups] the clients stand in the catalog's groups, with Other client last", async ({ page }) => {
    await show(page);
    const found = await sections(page);
    const count = (group: string) => MCP_PROVIDERS.entries.filter((e) => e.group === group).length;
    expect(found.map(({ title, names }) => ({ title, count: names.length }))).toEqual([
      { title: "Chat apps", count: count("chat") },
      { title: "Local models", count: count("models") },
      { title: "In the browser", count: count("web") },
      { title: "Editors", count: count("editor") },
      { title: "VS Code extensions", count: count("extension") },
      { title: "In the terminal", count: count("terminal") },
      { title: "Automation", count: count("automation") },
    ]);
    expect(found.at(-1)?.names.at(-1)).toBe("Other client");
  });

  test("[mcp-search] a client is found by its maker's name, and a pick hands back its id", async ({ page }) => {
    const search = await show(page);
    await search.fill("anthropic");
    await expect.poll(() => names(page)).toEqual(["Claude Desktop", "Claude", "Claude Code"]);
    await search.fill("vibe");
    await search.press("Enter");
    await expect(picker(page)).toHaveCount(0);
    await expect(stage(page, "PickerWindowMcpClients").locator("output")).toHaveText("Picked: Mistral Vibe");
  });
});

test.describe("The registry catalog in a PickerWindow", () => {
  const show = (page: Page) => showOther(page, "PickerWindowRegistries", "Add a registry", "Search registries");

  test("[registry-groups] public registries, then the clouds, then the self-hosted ones with Other registry last", async ({ page }) => {
    await show(page);
    const found = await sections(page);
    const count = (group: string) => REGISTRY_PROVIDERS.entries.filter((e) => e.group === group).length;
    expect(found.map(({ title, names }) => ({ title, count: names.length }))).toEqual([
      { title: "Public", count: count("public") },
      { title: "In a cloud account", count: count("cloud") },
      { title: "Self-hosted", count: count("selfHosted") },
    ]);
    expect(found.at(-1)?.names.at(-1)).toBe("Other registry Your own address");
  });

  test("[registry-hover] a multicoloured logo shows its one-colour drawing on the lit tile", async ({ page }) => {
    await show(page);
    const tile = picker(page).getByRole("button", { name: "GitLab registry.gitlab.com", exact: true });
    await expect(tile.locator(".glim-mark-hover")).toBeHidden();
    await tile.hover();
    await expect(tile.locator(".glim-mark-hover")).toBeVisible();
    await expect(tile.locator(".glim-mark-rest")).toBeHidden();
    expect(await tile.evaluate((b) => getComputedStyle(b).backgroundColor)).toBe("rgb(226, 67, 41)");
  });

  test("[registry-search] a registry is found by its host, and a pick hands back its id", async ({ page }) => {
    const search = await show(page);
    await search.fill("ghcr.io");
    await expect.poll(() => names(page)).toEqual(["GitHub ghcr.io"]);
    await search.press("Enter");
    await expect(picker(page)).toHaveCount(0);
    await expect(stage(page, "PickerWindowRegistries").locator("output")).toHaveText("Picked: GitHub");
  });
});

async function showVpn(page: Page) {
  await open(page, "/components/picker-window");
  await stage(page, "PickerWindowVpn").getByRole("button", { name: "Add a VPN" }).click();
  await expect(picker(page).getByRole("searchbox", { name: "Search VPNs" })).toBeFocused();
}

async function showDownload(page: Page) {
  await open(page, "/components/picker-window");
  await stage(page, "PickerWindowDownload").getByRole("button", { name: "Add an account" }).click();
  await expect(picker(page).getByRole("searchbox", { name: "Search services and hosters" })).toBeFocused();
}

async function showCaptcha(page: Page) {
  await open(page, "/components/picker-window");
  await stage(page, "PickerWindowCaptcha").getByRole("button", { name: "Add a solver" }).click();
  await expect(picker(page).getByRole("searchbox", { name: "Search solvers" })).toBeFocused();
}

async function showTransfer(page: Page) {
  await open(page, "/components/picker-window");
  await stage(page, "PickerWindowTransfer").getByRole("button", { name: "Add a transfer link" }).click();
  await expect(picker(page).getByRole("searchbox", { name: "Search transfer services" })).toBeFocused();
}

async function showIdentity(page: Page) {
  await open(page, "/components/picker-window");
  await stage(page, "PickerWindowIdentity").getByRole("button", { name: "Add single sign-on" }).click();
  await expect(picker(page).getByRole("searchbox", { name: "Search sign-in services" })).toBeFocused();
}

const sectionsOf = (page: Page) =>
  picker(page)
    .locator(".glim-pick-section")
    .evaluateAll((all) =>
      all.map((s) => ({
        title: s.querySelector(".glim-eyebrow")?.textContent,
        names: [...s.querySelectorAll(".glim-readme-btn-name")].map((n) => n.textContent ?? ""),
      })),
    );

const alphabetical = (names: string[]) => [...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

test.describe("The VPN catalog in a PickerWindow", () => {
  test("[vpn-groups] the providers stand first and alphabetical with the own configuration last, then those kept to their own app", async ({ page }) => {
    await showVpn(page);
    const sections = await sectionsOf(page);
    const count = (group: string) => VPN_PROVIDERS.entries.filter((e) => e.group === group).length;
    expect(sections.map(({ title, names }) => ({ title, count: names.length }))).toEqual([
      { title: "Providers", count: count("provider") },
      { title: "Only in their own app", count: count("appOnly") },
    ]);
    const [providers, appOnly] = sections.map((s) => s.names);
    expect(providers!.at(-1)).toBe("WireGuard");
    expect(providers!.slice(0, -1)).toEqual(alphabetical(providers!.slice(0, -1)));
    expect(appOnly).toEqual(alphabetical(appOnly!));
  });

  test("[vpn-waits] a provider kept to its own app stays in view with its reason, and a click does not pick it", async ({ page }) => {
    await showVpn(page);
    const express = picker(page).locator('.glim-provider-pick [aria-disabled="true"]', { hasText: "ExpressVPN" });
    await expect(express).toContainText("Not supported");
    await express.click();
    await expect(picker(page)).toHaveCount(1);
    await expect(picker(page).locator('.glim-provider-pick [aria-disabled="true"]')).toHaveCount(
      VPN_PROVIDERS.entries.filter((e) => e.group === "appOnly").length,
    );
  });

  test("[vpn-pick] the search finds a provider by its own words, and a pick hands back its id", async ({ page }) => {
    await showVpn(page);
    const search = picker(page).getByRole("searchbox", { name: "Search VPNs" });
    await search.fill("nordlynx");
    await expect.poll(() => names(page)).toEqual(["NordVPN"]);
    await search.press("Enter");
    await expect(picker(page)).toHaveCount(0);
    await expect(stage(page, "PickerWindowVpn").locator("output")).toHaveText("Picked: NordVPN");
  });

  test("[vpn-hover] Proton VPN shows its one-colour drawing with its cut-outs on the lit tile", async ({ page }) => {
    await showVpn(page);
    const tile = picker(page).getByRole("button", { name: "Proton VPN", exact: true });
    await expect(tile.locator(".glim-mark-hover")).toBeHidden();
    await tile.scrollIntoViewIfNeeded();
    await tile.hover();
    await expect(tile.locator(".glim-mark-hover")).toBeVisible();
    await expect(tile.locator(".glim-mark-rest")).toBeHidden();
    expect(await tile.evaluate((b) => getComputedStyle(b).backgroundColor)).toBe("rgb(109, 74, 255)");
  });
});

test.describe("The download catalog in a PickerWindow", () => {
  test("[download-groups] the debrid services stand first, then the hosters, each alphabetical", async ({ page }) => {
    await showDownload(page);
    const sections = await sectionsOf(page);
    const count = (group: string) => DOWNLOAD_PROVIDERS.entries.filter((e) => e.group === group).length;
    expect(sections.map(({ title, names }) => ({ title, count: names.length }))).toEqual([
      { title: "Debrid services", count: count("debrid") },
      { title: "File hosters", count: count("hoster") },
    ]);
    for (const { names } of sections) expect(names).toEqual(alphabetical(names));
  });

  test("[download-search] a hoster is found by another domain it answers on, and a pick hands back its id", async ({ page }) => {
    await showDownload(page);
    const search = picker(page).getByRole("searchbox", { name: "Search services and hosters" });
    await search.fill("rg.to");
    await expect.poll(() => names(page)).toEqual(["Rapidgator"]);
    await search.press("Enter");
    await expect(picker(page)).toHaveCount(0);
    await expect(stage(page, "PickerWindowDownload").locator("output")).toHaveText("Picked: Rapidgator");
  });

  test("[download-marks] a provider lights in its brand's colour, BestDebrid without a mark in the accent", async ({ page }) => {
    await showDownload(page);
    const fill = async (name: string) => {
      const tile = picker(page).getByRole("button", { name, exact: true });
      await tile.scrollIntoViewIfNeeded();
      await tile.hover();
      return tile.evaluate((b) => getComputedStyle(b).backgroundColor);
    };
    expect(await fill("Debrid-Link")).toBe("rgb(38, 78, 112)");
    const accent = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--accent)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });
    expect(await fill("Rapidgator")).toBe("rgb(252, 144, 32)");
    expect(await fill("BestDebrid")).toBe(accent);
  });
});

test.describe("The captcha catalog in a PickerWindow", () => {
  test("[captcha-groups] the solvers stand in one group, alphabetical", async ({ page }) => {
    await showCaptcha(page);
    const sections = await sectionsOf(page);
    expect(sections.map(({ title, names }) => ({ title, count: names.length }))).toEqual([
      { title: "Captcha solvers", count: CAPTCHA_PROVIDERS.entries.length },
    ]);
    expect(sections[0]!.names).toEqual(alphabetical(sections[0]!.names));
  });

  test("[captcha-search] a solver is found by the company behind it, and a pick hands back its id", async ({ page }) => {
    await showCaptcha(page);
    const search = picker(page).getByRole("searchbox", { name: "Search solvers" });
    await search.fill("zennolab");
    await expect.poll(() => names(page)).toEqual(["CapMonster Cloud"]);
    await search.press("Enter");
    await expect(picker(page)).toHaveCount(0);
    await expect(stage(page, "PickerWindowCaptcha").locator("output")).toHaveText("Picked: CapMonster Cloud");
  });

  test("[captcha-marks] every solver lights in its brand's colour", async ({ page }) => {
    await showCaptcha(page);
    const fill = async (name: string) => {
      const tile = picker(page).getByRole("button", { name, exact: true });
      await tile.hover();
      return tile.evaluate((b) => getComputedStyle(b).backgroundColor);
    };
    expect(await fill("CapMonster Cloud")).toBe("rgb(125, 110, 255)");
    expect(await fill("Anti-Captcha")).toBe("rgb(17, 29, 53)");
  });
});

test.describe("The transfer catalog in a PickerWindow", () => {
  test("[transfer-groups] the transfer services stand in one group, alphabetical, each with its mark", async ({ page }) => {
    await showTransfer(page);
    const sections = await sectionsOf(page);
    expect(sections).toEqual([{ title: "Transfer services", names: ["SwissTransfer", "WeTransfer"] }]);
    await expect(picker(page).locator(".glim-provider-pick button.glim-readme-btn .glim-readme-btn-mark svg")).toHaveCount(
      TRANSFER_PROVIDERS.entries.length,
    );
  });

  test("[transfer-search] a service is found by the short domain of its links, and a pick hands back its id", async ({ page }) => {
    await showTransfer(page);
    const search = picker(page).getByRole("searchbox", { name: "Search transfer services" });
    await search.fill("we.tl");
    await expect.poll(() => names(page)).toEqual(["WeTransfer"]);
    await search.press("Enter");
    await expect(picker(page)).toHaveCount(0);
    await expect(stage(page, "PickerWindowTransfer").locator("output")).toHaveText("Picked: WeTransfer");
  });

  test("[transfer-marks] each service lights in its brand's colour", async ({ page }) => {
    await showTransfer(page);
    const fill = async (name: string) => {
      const tile = picker(page).getByRole("button", { name, exact: true });
      await tile.hover();
      return tile.evaluate((b) => getComputedStyle(b).backgroundColor);
    };
    expect(await fill("WeTransfer")).toBe("rgb(64, 159, 255)");
    expect(await fill("SwissTransfer")).toBe("rgb(59, 180, 113)");
  });
});

test.describe("The identity catalog in a PickerWindow", () => {
  test("[identity-groups] the sign-in services stand in one group, alphabetical, with the app's own Other sign-in service last", async ({ page }) => {
    await showIdentity(page);
    const sections = await sectionsOf(page);
    const names = alphabetical(IDENTITY_PROVIDERS.entries.map((e) => e.name));
    expect(sections).toEqual([{ title: "Self-hosted", names: [...names, "Other sign-in service"] }]);
    const marks = picker(page).locator(".glim-provider-pick button.glim-readme-btn .glim-readme-btn-mark");
    await expect(marks.filter({ has: page.locator("svg") })).toHaveCount(IDENTITY_PROVIDERS.entries.length + 1);
  });

  test("[identity-search] a service is found by a protocol it speaks besides OpenID Connect, and a pick hands back its id", async ({ page }) => {
    await showIdentity(page);
    const search = picker(page).getByRole("searchbox", { name: "Search sign-in services" });
    await search.fill("saml");
    await expect.poll(() => names(page)).toEqual(["authentik", "Keycloak", "ZITADEL"]);
    await search.fill("passkeys");
    await expect.poll(() => names(page)).toEqual(["Pocket ID"]);
    await search.press("Enter");
    await expect(picker(page)).toHaveCount(0);
    await expect(stage(page, "PickerWindowIdentity").locator("output")).toHaveText("Picked: Pocket ID");
  });

  test("[identity-marks] a service lights in its brand's colour, the Other sign-in service in the accent", async ({ page }) => {
    await showIdentity(page);
    const fill = async (name: string) => {
      const tile = picker(page).getByRole("button", { name, exact: true });
      await tile.hover();
      return tile.evaluate((b) => getComputedStyle(b).backgroundColor);
    };
    expect(await fill("authentik")).toBe("rgb(253, 75, 45)");
    expect(await fill("Authelia")).toBe("rgb(17, 49, 85)");
    const accent = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--accent)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });
    expect(await fill("Kanidm")).toBe("rgb(255, 102, 0)");
    expect(await fill("Other sign-in service")).toBe(accent);
  });

  test("[identity-hover] Keycloak shows its one-colour drawing on the lit tile", async ({ page }) => {
    await showIdentity(page);
    const tile = picker(page).getByRole("button", { name: "Keycloak", exact: true });
    await expect(tile.locator(".glim-mark-hover")).toBeHidden();
    await tile.hover();
    await expect(tile.locator(".glim-mark-hover")).toBeVisible();
    await expect(tile.locator(".glim-mark-rest")).toBeHidden();
    expect(await tile.evaluate((b) => getComputedStyle(b).backgroundColor)).toBe("rgb(0, 117, 143)");
  });
});
