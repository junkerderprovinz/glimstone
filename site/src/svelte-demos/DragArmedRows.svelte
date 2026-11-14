<script lang="ts">
  import { dropIndex } from "@glimstone/core";
  import { useDragArmed } from "@glimstone/svelte";

  const DOWNLOADS = ["debian-13.iso", "podcast-episode-212.mp3", "photos-2026.zip", "firmware-v4.bin", "dataset.tar.gz"];

  let list = $state<HTMLDivElement | null>(null);
  let order = $state(DOWNLOADS);
  let held = $state<string | null>(null);
  let shift = $state(0);
  let start = 0;
  useDragArmed(() => list, () => held !== null);

  function press(e: PointerEvent & { currentTarget: HTMLDivElement }, name: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    start = e.clientY;
    held = name;
  }
  function move(e: PointerEvent) {
    if (held !== null) shift = e.clientY - start;
  }
  function cancel() {
    held = null;
    shift = 0;
  }
  function drop() {
    const name = held;
    if (name === null || !list) return;
    const boxes = [...list.children].map((r) => {
      const row = r as HTMLElement;
      return { left: row.offsetLeft, top: row.offsetTop, width: row.offsetWidth, height: row.offsetHeight };
    });
    const at = order.indexOf(name);
    const from = boxes[at]!;
    const next = order.filter((n) => n !== name);
    next.splice(dropIndex({ ...from, top: from.top + shift }, from, boxes.filter((_, i) => i !== at)), 0, name);
    order = next;
    cancel();
  }
</script>

<!-- Rows as wide as the list tremble with the row wiggle, which tilts them far less. -->
<div bind:this={list} role="list" aria-label="Downloads" class="demo-drag-rows glim-drag-rows">
  {#each order as name (name)}
    <div
      role="listitem"
      class={`demo-drag-row${held === name ? " glim-drag-lift" : ""}`}
      style={held === name ? `translate: 0 ${shift}px` : undefined}
      onpointerdown={(e) => press(e, name)}
      onpointermove={move}
      onpointerup={drop}
      onpointercancel={cancel}
    >
      {name}
    </div>
  {/each}
</div>
