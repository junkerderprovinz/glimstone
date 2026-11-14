<script lang="ts">
  import { Selector } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const PAGES = [
    { id: "general", label: "General", glyph: glyph("IconTabGeneral") },
    { id: "look", label: "Look", glyph: glyph("IconTabLook") },
    { id: "storage", label: "Storage locations", glyph: glyph("IconTabStorage") },
    { id: "notifications", label: "Notifications", glyph: glyph("IconNotifications") },
    { id: "security", label: "Security", glyph: glyph("IconTabSecurity") },
    { id: "app", label: "App", glyph: glyph("IconTabApp"), dim: true },
  ].map((p) => ({ ...p, href: `#/settings/${p.id}` }));

  let page = $state("general");
</script>

<div style="display: flex; gap: 16px; width: 100%; height: 320px">
  <Selector label="Settings pages" orientation="vertical" items={PAGES} bind:value={page} />
  <div style="flex: 1; padding: 8px 0">The {PAGES.find((p) => p.id === page)!.label} page.</div>
</div>
