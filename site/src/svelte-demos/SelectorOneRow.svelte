<script lang="ts">
  import { Selector } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const SHOWN = [
    { id: "open", label: "Open" },
    { id: "closed", label: "Closed in the last 30 days" },
  ];

  const LOOKS = [
    { id: "light", label: "Always the light theme", glyph: glyph("IconSun") },
    { id: "dark", label: "Always the dark theme", glyph: glyph("IconMoon") },
    { id: "system", label: "Follow the system", glyph: glyph("IconThemeSystem") },
  ];

  const THEMES = [
    { id: "system", label: "Follow the system" },
    { id: "light", label: "Always the light theme" },
    { id: "dark", label: "Always the dark theme" },
  ];

  const JOBS = [
    { id: "running", label: "Running" },
    { id: "queued", label: "Waiting in the queue" },
    { id: "done", label: "Finished in the last 30 days" },
  ];

  let shown = $state("open");
  let look = $state("light");
  let a = $state("system");
  let b = $state("system");
  let jobs = $state<string[]>(["running"]);
</script>

<div style="display: grid; gap: 16px; width: 100%; max-width: 560px">
  <div data-row="labels">
    <Selector label="Shown" items={SHOWN} bind:value={shown} activation="manual" equalWidth />
  </div>
  <div data-row="glyphs">
    <Selector label="Look" items={LOOKS} bind:value={look} activation="manual" size="lg" equalWidth />
  </div>
  <div data-row="list">
    <Selector label="Theme" items={THEMES} bind:value={a} activation="manual" />
  </div>
  <div data-row="list-inline">
    <Selector label="Theme, inline" items={THEMES} bind:value={b} activation="manual" size="sm" inline buttonHeight />
  </div>
  <div data-row="cut">
    <Selector label="Jobs" select="many" items={JOBS} bind:value={jobs} />
  </div>
</div>
