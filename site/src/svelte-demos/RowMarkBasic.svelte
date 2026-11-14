<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { RowMark } from "@glimstone/svelte";

  const FILES = ["holiday.mkv", "notes.txt", "backup.tar"];

  const picked = new SvelteSet(["holiday.mkv"]);
  const flip = (name: string) => {
    if (!picked.delete(name)) picked.add(name);
  };
</script>

<div role="listbox" aria-multiselectable="true" aria-label="Files" style="display: grid; gap: 2px; width: 280px; font-size: 13px">
  {#each FILES as name (name)}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_interactive_supports_focus -->
    <div role="option" aria-selected={picked.has(name)} class="demo-dense-row" onclick={() => flip(name)}>
      <RowMark on={picked.has(name)} />
      {name}
    </div>
  {/each}
</div>
