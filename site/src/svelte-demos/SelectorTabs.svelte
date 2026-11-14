<script lang="ts">
  import { Selector, selectorTabId } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const PAGES = [
    { id: "general", label: "General", glyph: glyph("IconTabGeneral") },
    { id: "look", label: "Look", glyph: glyph("IconTabLook") },
    { id: "storage", label: "Storage", glyph: glyph("IconTabStorage") },
    { id: "notifications", label: "Notifications", glyph: glyph("IconNotifications") },
  ];

  let page = $state("general");
  const panel = $props.id();
</script>

<div style="display: grid; gap: 16px; width: 100%">
  <Selector label="Settings pages" items={PAGES} bind:value={page} size="lg" variant="chip" hueOffset={0} panelId={panel} />
  <div role="tabpanel" id={panel} aria-labelledby={selectorTabId(panel, page)}>
    The {PAGES.find((p) => p.id === page)!.label} page.
  </div>
</div>
