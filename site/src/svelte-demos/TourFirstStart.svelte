<script lang="ts">
  import { Button } from "@glimstone/svelte";
  import { Tour } from "@glimstone/svelte/Tour";

  let open = $state(false);
  let add = $state<HTMLElement | null>(null);
  let search = $state<HTMLElement | null>(null);
  const steps = [
    { id: "add", target: () => add, title: "Add a backup", description: "Everything starts here: pick what to back up and where it goes." },
    { id: "search", target: () => search, title: "Find a file", description: "Search every backup at once, by name or by folder." },
    { id: "end", title: "That is all", description: "The rest is on the Help page whenever it is needed." },
  ];
</script>

<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
  <div bind:this={add} style="padding: 8px">Add</div>
  <div bind:this={search} style="padding: 8px">Search</div>
  <Button label="Start the tour" labelKey={null} onClick={() => (open = true)} />
  <Tour {steps} bind:open />
</div>
