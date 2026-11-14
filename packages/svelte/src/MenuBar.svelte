<script lang="ts" module>
  import type { MenuEntry } from "./ContextMenu.svelte";

  export type { MenuBarHandle } from "@glimstone/core";

  export interface MenuBarMenu {
    label: string;
    items: MenuEntry[];
    /** The id of the open menu, for a caller or a script that looks for it. */
    id?: string;
  }

  export interface MenuBarProps {
    /** The bar's accessible name, such as "Menu". */
    label: string;
    menus: MenuBarMenu[];
    class?: string;
  }
</script>

<script lang="ts">
  import ContextMenu from "./ContextMenu.svelte";

  // The menu bar of a desktop-style app: a row of words, each opening its menu
  // below it. While one is open the pointer and the arrow keys move between
  // them, as in a desktop program. The app opens the first one on F10 through
  // `open` on the instance it binds, since which key does it is the app's keymap.
  let { label, menus, class: className }: MenuBarProps = $props();

  const buttons: (HTMLButtonElement | null)[] = $state([]);
  let shown = $state.raw<{ at: number; x: number; y: number; fromEnd: boolean } | null>(null);
  let stop = $state(0);
  const count = $derived(menus.length);

  function show(at: number, fromEnd = false) {
    const button = buttons[at];
    if (!button) return;
    button.focus();
    stop = at;
    const r = button.getBoundingClientRect();
    shown = { at, x: r.left, y: r.bottom + 6, fromEnd };
  }

  /** Opens a menu by its index and puts the focus on its first row. */
  export function open(at: number) {
    show(at);
  }

  function keys(e: KeyboardEvent, at: number) {
    const rtl = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
    const step = ({ ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 } as Record<string, number | undefined>)[e.key];
    const to = step !== undefined ? (at + step + count) % count : ({ Home: 0, End: count - 1 } as Record<string, number | undefined>)[e.key];
    if (to !== undefined) {
      e.preventDefault();
      stop = to;
      buttons[to]?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      show(at, e.key === "ArrowUp");
    }
  }
</script>

<div data-glim="MenuBar" role="menubar" aria-label={label} class={className ? `glim-menubar ${className}` : "glim-menubar"}>
  {#each menus as m, i}
    <button
      bind:this={buttons[i]}
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={shown?.at === i}
      tabindex={i === stop ? 0 : -1}
      class="glim-menubar-item"
      onclick={() => (shown?.at === i ? (shown = null) : show(i))}
      onmouseenter={() => shown && shown.at !== i && show(i)}
      onkeydown={(e) => keys(e, i)}
      onfocus={() => (stop = i)}
    >
      {m.label}
    </button>
  {/each}
  {#if shown && menus[shown.at]}
    {@const at = shown.at}
    {#key at}
      <ContextMenu
        x={shown.x}
        y={shown.y}
        items={menus[at]!.items}
        label={menus[at]!.label}
        id={menus[at]!.id}
        opener={buttons[at]}
        onClose={() => (shown = null)}
        onStep={(d) => show((at + d + count) % count)}
        fromEnd={shown.fromEnd}
      />
    {/key}
  {/if}
</div>
