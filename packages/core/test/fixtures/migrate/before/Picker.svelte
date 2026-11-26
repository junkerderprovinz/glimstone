<script lang="ts">
  import { Selector } from "@glimstone/svelte";
  let { phone }: { phone: boolean } = $props();
  let pick = $state("a");
</script>

<Selector items={[]} bind:value={pick} pairsOnPhone />
<Selector items={[]} bind:value={pick} pairsOnPhone={phone} fit />
