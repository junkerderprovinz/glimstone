<script lang="ts">
  import { searchParts } from "@glimstone/core";

  // A row's label in a list that filters as somebody types, with the part
  // that matches the search set apart.
  let { label, query }: { label: string; query: string } = $props();
  const parts = $derived(searchParts(label, query));
</script>

{#if parts}{parts.before}<span class="glim-combobox-hit">{parts.hit}</span>{parts.after}{:else}{label}{/if}
