<script lang="ts">
  import { ScrollArea } from "@glimstone/svelte/ScrollArea";

  const lines = Array.from({ length: 30 }, (_, i) => `04:${String(10 + i).padStart(2, "0")}  Copied folder ${i + 1} of 30`);
</script>

<div class="glim-well" style="width: min(30rem, 100%); padding: 0">
  <ScrollArea label="Backup log" maxHeight="10rem">
    <div class="glim-num" style="padding: 12px; display: grid; gap: 4px">
      {#each lines as line (line)}
        <span>{line}</span>
      {/each}
    </div>
  </ScrollArea>
</div>
