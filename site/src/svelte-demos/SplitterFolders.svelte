<script lang="ts">
  import { Splitter } from "@glimstone/svelte/Splitter";

  const panels = [
    { id: "folders", minSize: 20, lines: ["Documents", "Photos", "Music"] },
    { id: "files", minSize: 30, lines: ["holiday.jpg", "harbour.jpg", "market.jpg"] },
  ];
  let size = $state([35, 65]);
</script>

<div style="display: grid; gap: 12px; width: min(36rem, 100%)">
  <div class="glim-well" style="height: 160px; padding: 0">
    <Splitter {panels} bind:size>
      {#snippet panel(p)}
        <ul style="margin: 0; padding: 12px; list-style: none">
          {#each p.lines as line (line)}
            <li>{line}</li>
          {/each}
        </ul>
      {/snippet}
    </Splitter>
  </div>
  <span class="glim-num">{`Folders ${Math.round(size[0]!)} %, files ${Math.round(size[1]!)} %`}</span>
</div>
