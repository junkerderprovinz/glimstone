<script lang="ts">
  import { dropIndex } from "@glimstone/core";
  import { useDragArmed } from "@glimstone/svelte";

  const APPS = ["Mail", "Photos", "Music", "Notes", "Maps", "Files"];

  let list = $state<HTMLDivElement | null>(null);
  let order = $state(APPS);
  let held = $state<string | null>(null);
  let shift = $state<{ x: number; y: number } | null>(null);
  let start = { x: 0, y: 0 };
  useDragArmed(() => list, () => held !== null);

  function press(e: PointerEvent & { currentTarget: HTMLDivElement }, name: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    start = { x: e.clientX, y: e.clientY };
    held = name;
  }
  function move(e: PointerEvent) {
    if (held !== null) shift = { x: e.clientX - start.x, y: e.clientY - start.y };
  }
  function cancel() {
    held = null;
    shift = null;
  }
  function drop() {
    const name = held;
    if (name === null || !list) return;
    // Offsets leave out the lift's scale and translate, so each box is a tile's place.
    const boxes = [...list.children].map((t) => {
      const tile = t as HTMLElement;
      return { left: tile.offsetLeft, top: tile.offsetTop, width: tile.offsetWidth, height: tile.offsetHeight };
    });
    const at = order.indexOf(name);
    const from = boxes[at]!;
    const moved = { ...from, left: from.left + (shift?.x ?? 0), top: from.top + (shift?.y ?? 0) };
    const next = order.filter((n) => n !== name);
    next.splice(dropIndex(moved, from, boxes.filter((_, i) => i !== at), { axis: "grid" }), 0, name);
    order = next;
    cancel();
  }
</script>

<!-- The list rewrites its own class once the tile moves, which is what the hook has to survive. -->
<div bind:this={list} role="list" aria-label="Apps" class={`demo-drag-tiles${shift ? " is-moving" : ""}`}>
  {#each order as name (name)}
    <div
      role="listitem"
      class={`demo-drag-tile${held === name ? " glim-drag-lift" : ""}`}
      style={held === name && shift ? `translate: ${shift.x}px ${shift.y}px` : undefined}
      onpointerdown={(e) => press(e, name)}
      onpointermove={move}
      onpointerup={drop}
      onpointercancel={cancel}
    >
      {name}
    </div>
  {/each}
</div>
