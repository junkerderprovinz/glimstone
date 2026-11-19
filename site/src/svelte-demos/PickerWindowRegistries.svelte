<script lang="ts">
  import { Button, PickerWindow } from "@glimstone/svelte";
  import { REGISTRY_TEXT, registryLine, registryPicker } from "../registryData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = registryPicker(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
</script>

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Add a registry" labelKey="add" onClick={() => (open = true)} />
  <output>{registryLine(picked)}</output>
  {#if open}
    <PickerWindow
      title="Add a registry"
      hint="Where private images come from. Pick the registry to sign in to."
      {items}
      {groups}
      text={REGISTRY_TEXT}
      onPick={(id) => {
        open = false;
        picked = id;
      }}
      onClose={() => (open = false)}
    />
  {/if}
</div>
