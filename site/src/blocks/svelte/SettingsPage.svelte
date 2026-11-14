<script lang="ts">
  import { Card, FieldRow, FieldRowGroup, Selector, TextField, Toggle } from "@glimstone/svelte";
  import { oledRefusal } from "@glimstone/core";
  import { glyph } from "../../svelte/glyph";

  const PAGES = [
    { id: "general", label: "General", glyph: glyph("IconTabGeneral") },
    { id: "look", label: "Look", glyph: glyph("IconTabLook") },
    { id: "notifications", label: "Notifications", glyph: glyph("IconNotifications") },
  ];

  const THEMES = [
    { id: "dark", label: "Dark", glyph: glyph("IconMoon") },
    { id: "light", label: "Light", glyph: glyph("IconSun") },
    { id: "system", label: "System", glyph: glyph("IconThemeSystem") },
  ];

  const CHANNELS = [
    { id: "stable", label: "Stable" },
    { id: "beta", label: "Beta" },
  ];

  // Every change takes effect as it is made, so the page has no Save button.
  let page = $state("general");
  let name = $state("Atlas");
  let autostart = $state(true);
  let updates = $state(true);
  let channel = $state("stable");
  let theme = $state("system");
  let oled = $state(false);
  let failures = $state(true);
  let weekly = $state(false);
</script>

<div style="display: flex; flex-wrap: wrap; gap: 24px; width: 100%; min-height: 360px">
  <Selector label="Settings pages" orientation="vertical" items={PAGES} bind:value={page} />
  <div style="flex: 1 1 20rem; min-width: 0; display: grid; align-content: start; gap: 40px; padding-top: 12px">
    {#if page === "general"}
      <Card title="General">
        <FieldRowGroup>
          <FieldRow label="Name">
            <TextField width="grow" bind:value={name} error={name.trim() ? undefined : "The instance needs a name"} />
          </FieldRow>
          <FieldRow label="Start with the system">
            <Toggle bind:checked={autostart} />
          </FieldRow>
        </FieldRowGroup>
      </Card>
      <Card title="Updates">
        <FieldRowGroup>
          <FieldRow label="Look for updates">
            <Toggle bind:checked={updates} />
          </FieldRow>
          <FieldRow label="Channel">
            <Selector inline items={CHANNELS} bind:value={channel} disabled={!updates} />
          </FieldRow>
        </FieldRowGroup>
      </Card>
    {:else if page === "look"}
      <Card title="Look">
        <FieldRowGroup>
          <FieldRow label="Theme">
            <Selector inline items={THEMES} bind:value={theme} />
          </FieldRow>
          <FieldRow label="OLED" hint="True black for OLED and AMOLED screens, whenever the dark look is showing.">
            <Toggle bind:checked={oled} refused={oledRefusal(theme)} />
          </FieldRow>
        </FieldRowGroup>
      </Card>
    {:else}
      <Card title="Notifications">
        <FieldRowGroup>
          <FieldRow label="When a backup fails">
            <Toggle bind:checked={failures} />
          </FieldRow>
          <FieldRow label="A summary every week">
            <Toggle bind:checked={weekly} />
          </FieldRow>
        </FieldRowGroup>
      </Card>
    {/if}
  </div>
</div>
