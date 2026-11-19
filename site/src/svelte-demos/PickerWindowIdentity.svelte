<script lang="ts">
  import { Button, PickerWindow } from "@glimstone/svelte";
  import { IDENTITY_TEXT, identityLine, identityPicker } from "../identityData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = identityPicker(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
</script>

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Add single sign-on" labelKey="add" onClick={() => (open = true)} />
  <output>{identityLine(picked)}</output>
  {#if open}
    <PickerWindow
      title="Add single sign-on"
      hint="The service people sign in through, over OpenID Connect."
      {items}
      {groups}
      text={IDENTITY_TEXT}
      onPick={(id) => {
        open = false;
        picked = id;
      }}
      onClose={() => (open = false)}
    />
  {/if}
</div>
