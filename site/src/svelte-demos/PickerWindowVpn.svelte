<script lang="ts">
  import { Button, PickerWindow } from "@glimstone/svelte";
  import { VPN_TEXT, vpnLine, vpnPicker } from "../vpnData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = vpnPicker(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
</script>

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Add a VPN" labelKey="add" onClick={() => (open = true)} />
  <output>{vpnLine(picked)}</output>
  {#if open}
    <PickerWindow
      title="Add a VPN"
      hint="Where the traffic goes. Pick your provider, or a WireGuard server of your own."
      {items}
      {groups}
      text={VPN_TEXT}
      onPick={(id) => {
        open = false;
        picked = id;
      }}
      onClose={() => (open = false)}
    />
  {/if}
</div>
