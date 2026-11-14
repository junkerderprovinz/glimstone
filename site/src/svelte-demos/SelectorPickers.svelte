<script lang="ts">
  import { Selector } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const THEMES = [
    { id: "light", label: "Light", glyph: glyph("IconSun") },
    { id: "dark", label: "Dark", glyph: glyph("IconMoon") },
    { id: "system", label: "System", glyph: glyph("IconThemeSystem") },
  ];

  const STATES = [
    { id: "running", label: "Running" },
    { id: "stopped", label: "Stopped" },
    { id: "paused", label: "Paused" },
    { id: "failed", label: "Failed", disabled: true, title: "Nothing has failed" },
  ];

  const caption = "font-size: 13px; color: var(--carbon-text-sub)";

  let theme = $state("dark");
  let shown = $state(["running", "paused"]);
</script>

<div style="display: grid; gap: 20px; width: 100%">
  <div style="display: grid; gap: 8px">
    <span style={caption}>Theme</span>
    <Selector label="Theme" items={THEMES} bind:value={theme} activation="manual" equalWidth />
  </div>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
    <span style={caption}>Show</span>
    <Selector label="Show" select="many" items={STATES} bind:value={shown} variant="chip" inline />
  </div>
</div>
