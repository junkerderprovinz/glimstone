<script lang="ts">
  import { Button, PickerWindow } from "@glimstone/svelte";
  import { MCP_TEXT, mcpLine, mcpPicker } from "../mcpData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = mcpPicker(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
</script>

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Connect a client" labelKey="add" onClick={() => (open = true)} />
  <output>{mcpLine(picked)}</output>
  {#if open}
    <PickerWindow
      title="Connect a client"
      hint="The AI app that connects to this server, so the steps that follow fit it."
      {items}
      {groups}
      text={MCP_TEXT}
      onPick={(id) => {
        open = false;
        picked = id;
      }}
      onClose={() => (open = false)}
    />
  {/if}
</div>
