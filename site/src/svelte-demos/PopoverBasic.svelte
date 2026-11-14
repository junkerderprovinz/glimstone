<script lang="ts">
  import { Button, Popover, TextField } from "@glimstone/svelte";

  let anchor = $state<HTMLElement | null>(null);
  let open = $state(false);
</script>

<Button bind:ref={anchor} label="Filter" labelKey="filter" onClick={() => (open = !open)} aria-expanded={open} />
<Popover {open} {anchor} label="Filter the list" onClose={() => (open = false)}>
  <div style="display: grid; gap: 12px">
    <TextField label="Name contains" width="medium" />
    <Button label="Apply" labelKey={null} tone="accent" onClick={() => (open = false)} />
  </div>
</Popover>
