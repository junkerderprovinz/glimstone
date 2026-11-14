<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { Checkbox } from "@glimstone/svelte";

  const files = ["thumbs.db", "desktop.ini", "old-cache.tmp"];
  const picked = new SvelteSet(["thumbs.db"]);

  function flip(name: string, on: boolean) {
    if (on) picked.add(name);
    else picked.delete(name);
  }
</script>

<div style="display: grid; gap: 2px; width: 280px; font-size: 13px">
  {#each files as name (name)}
    <span class="demo-dense-row">
      <Checkbox slim label={name} checked={picked.has(name)} onChange={(on) => flip(name, on)} />
      {name}
    </span>
  {/each}
</div>
