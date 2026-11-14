<script lang="ts">
  import { ColorPicker } from "@glimstone/svelte";

  let applied = $state("#fcc419");
  let live = $state("#fcc419");
</script>

<div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap">
  <ColorPicker value={applied} onInput={(hex) => (live = hex)} onApply={(hex) => (applied = hex)} />
  <p style="margin: 0">
    Live <code>{live}</code>
    <br />
    Applied <code>{applied}</code>
  </p>
</div>
