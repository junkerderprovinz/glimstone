<script lang="ts">
  import { Pagination } from "@glimstone/svelte/Pagination";

  let page = $state(1);
</script>

<div style="display: grid; gap: 12px; justify-items: start">
  <Pagination count={195} bind:page />
  <span class="glim-num">{`Backups ${(page - 1) * 10 + 1} to ${Math.min(page * 10, 195)} of 195`}</span>
</div>
