<script lang="ts">
  import { DropdownListbox } from "@glimstone/svelte";

  const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"];
  let open = $state(false);
  let zone = $state(ZONES[0]!);
  let trigger = $state<HTMLButtonElement | null>(null);

  function pick(z: string) {
    zone = z;
    open = false;
  }
</script>

<button
  bind:this={trigger}
  type="button"
  class="field"
  style="min-width: 220px; text-align: start; cursor: pointer"
  aria-haspopup="listbox"
  aria-expanded={open}
  onclick={() => (open = !open)}
>
  {zone}
</button>
<DropdownListbox {open} onClose={() => (open = false)} triggerRef={trigger} label="Time zone">
  {#each ZONES as z (z)}
    <button
      type="button"
      role="option"
      aria-selected={z === zone}
      class="block w-full px-3 py-2 text-start text-sm text-carbon-text hover:bg-carbon-hover aria-selected:font-semibold"
      onclick={() => pick(z)}
    >
      {z}
    </button>
  {/each}
</DropdownListbox>
