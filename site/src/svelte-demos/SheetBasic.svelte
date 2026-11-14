<script lang="ts">
  import { Button, IconButton, Sheet } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  let open = $state(false);
</script>

<Button label="Details" labelKey={null} onClick={() => (open = true)} />
<Sheet
  {open}
  title="Nightly backup"
  text={{ cancel: "Cancel", close: "Close" }}
  actions={[{ label: "Run now", labelKey: null, primary: true }]}
  onClose={() => (open = false)}
>
  <p style="margin: 0">Runs at three in the morning and keeps the last fourteen copies.</p>
  <div>
    <IconButton tip="Copy the path" glyph={glyph("IconCopy")} />
  </div>
</Sheet>
