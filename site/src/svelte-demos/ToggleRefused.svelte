<script lang="ts">
  import { oledRefusal } from "@glimstone/core";
  import { FieldRow, Selector, Toggle } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const THEMES = [
    { id: "dark", label: "Dark", glyph: glyph("IconMoon") },
    { id: "light", label: "Light", glyph: glyph("IconSun") },
    { id: "system", label: "System", glyph: glyph("IconThemeSystem") },
  ];

  let theme = $state("light");
  let oled = $state(true);
</script>

<div style="display: grid; gap: 12px; width: 100%; max-width: 420px">
  <Selector label="Design" items={THEMES} bind:value={theme} activation="manual" equalWidth />
  <FieldRow label="OLED" hint="True black for OLED and AMOLED screens, whenever the dark look is showing.">
    <Toggle bind:checked={oled} refused={oledRefusal(theme)} />
  </FieldRow>
</div>
