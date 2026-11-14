<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { MenuEntry as CoreMenuEntry, MenuHead as CoreMenuHead, MenuItem as CoreMenuItem } from "@glimstone/core";

  export type MenuEntry = CoreMenuEntry<Snippet>;
  export type MenuItem = CoreMenuItem<Snippet>;
  export type MenuHead = CoreMenuHead<Snippet>;

  export interface ContextMenuProps {
    /** The point the menu hangs from, in viewport pixels, such as the pointer's. */
    x: number;
    y: number;
    items: MenuEntry[];
    /** Stand the menu on the point instead, for a menu opened from a bar at the bottom. */
    above?: boolean;
    /** The menu's accessible name. */
    label?: string;
    /** The menu element's id, for a caller or a script that looks for it. */
    id?: string;
    /** The control that opened the menu. A click on it is not a click outside,
     *  and focus goes back to it; without one, focus goes back to wherever it was. */
    opener?: HTMLElement | null;
    /** Called on every way out: a choice, Escape, Tab or a click outside. */
    onClose: () => void;
    /** Left or right on a row without a submenu, for a bar that steps to the next menu. */
    onStep?: (direction: 1 | -1) => void;
    /** Opens with the focus on the last row, as ArrowUp on a menu bar's word asks. */
    fromEnd?: boolean;
  }
</script>

<script lang="ts">
  import { onMount, untrack } from "svelte";
  import {
    claimMenu,
    closeMenuOutside,
    focusedAsker,
    focusFirstMenuRow,
    focusMenuRow,
    focusMenuRowByLetter,
    isTypeahead,
    isMenuHead,
    menuMove,
    menuRowView,
    placeMenu,
    placeSubmenu,
    returnFocus,
    tidyMenu,
  } from "@glimstone/core";
  import { lift } from "./lift.js";
  import MenuRows from "./MenuRows.svelte";

  // A menu at a point: a right-click on a row, the More button of a list, or a
  // menu of the bar. Mount it to open it and unmount it on onClose. The model,
  // the placing and the keys come from menu.ts in the core.
  //
  // A submenu opens beside its row as a second menu on the body, one level deep.
  // A checkbox item leaves the menu open, so several can be ticked in a row; the
  // caller flips `checked` and the row follows.
  let { x, y, items, above = false, label, id, opener, onClose, onStep, fromEnd = false }: ContextMenuProps = $props();

  let menu = $state<HTMLElement | null>(null);
  let subMenu = $state<HTMLElement | null>(null);
  const asker = focusedAsker();
  let pos = $state.raw(untrack(() => ({ left: x, top: y })));
  let sub = $state.raw<{ at: number; focus: boolean } | null>(null);
  let subPos = $state.raw<{ left: number; top: number } | null>(null);

  const viewport = () => ({ width: innerWidth, height: innerHeight });
  const opensSub = (entry: MenuEntry | undefined): entry is MenuItem => !!entry && entry !== "-" && !isMenuHead(entry) && !!entry.sub;
  const px = (at: { left: number; top: number }) => `left: ${at.left}px; top: ${at.top}px`;

  const rows = $derived(tidyMenu(items));
  const host = $derived.by(() => {
    const entry = sub ? rows[sub.at] : undefined;
    return opensSub(entry) ? entry : undefined;
  });
  const subRows = $derived(host?.sub ? tidyMenu(host.sub) : null);

  // Focus goes back only on a way out somebody chose; a click elsewhere keeps
  // the focus it gave. The opener is read first, since closing unmounts the
  // menu and the caller may forget it.
  function finish(handBack: boolean) {
    const back = opener ?? asker;
    onClose();
    if (handBack) returnFocus(back);
  }

  $effect(() => {
    if (menu) pos = placeMenu(x, y, { width: menu.offsetWidth, height: menu.offsetHeight }, viewport(), above);
  });

  onMount(() => {
    const release = claimMenu(finish);
    const outside = closeMenuOutside(
      () => [menu, subMenu, opener],
      () => finish(false),
    );
    if (menu && fromEnd) focusMenuRow(menu, "last");
    else if (menu) focusFirstMenuRow(menu);
    return () => {
      release();
      outside();
    };
  });

  $effect(() => {
    const open = sub;
    const row = open && menu?.querySelector(`[data-row="${open.at}"]`);
    const el = subMenu;
    if (!open || !row || !el || !subRows) {
      subPos = null;
      return;
    }
    const rtl = getComputedStyle(menu!).direction === "rtl";
    subPos = placeSubmenu(row.getBoundingClientRect(), { width: el.offsetWidth, height: el.offsetHeight }, viewport(), rtl);
    if (open.focus) focusFirstMenuRow(el);
  });

  function pick(list: MenuEntry[], at: number) {
    const entry = list[at]!;
    if (entry === "-") return;
    if (isMenuHead(entry)) {
      finish(true);
      entry.edit?.onSelect();
      return;
    }
    if (entry.sub && list === rows) {
      sub = { at, focus: true };
      return;
    }
    if (menuRowView(entry).staysOpen) {
      entry.onSelect?.();
      return;
    }
    finish(true);
    entry.onSelect?.();
  }

  function keys(e: KeyboardEvent, inSub: boolean) {
    if (e.key === "Tab") return finish(false);
    const panel = e.currentTarget as HTMLElement;
    if (isTypeahead(e)) {
      if (focusMenuRowByLetter(panel, e.key)) e.preventDefault();
      return;
    }
    const move = menuMove(e.key, getComputedStyle(panel).direction === "rtl");
    if (!move) return;
    e.preventDefault();
    if (move !== "in" && move !== "out") return focusMenuRow(panel, move);
    if (inSub) {
      if (move === "out" && sub) {
        menu?.querySelector<HTMLElement>(`[data-row="${sub.at}"]`)?.focus();
        sub = null;
      }
      return;
    }
    const at = Number((document.activeElement as HTMLElement | null)?.dataset.row);
    const entry = rows[at];
    if (move === "in" && opensSub(entry) && !entry.disabled) sub = { at, focus: true };
    else onStep?.(move === "in" ? 1 : -1);
  }

  // The pointer opens a submenu by resting on its row and closes it on any other row.
  function hover(e: MouseEvent) {
    const row = (e.target as Element).closest<HTMLElement>("[data-row]");
    if (!row) return;
    const at = Number(row.dataset.row);
    const entry = rows[at];
    const opens = opensSub(entry) && !entry.disabled;
    if (opens && sub?.at !== at) sub = { at, focus: false };
    else if (!opens && sub) sub = null;
  }
</script>

<!-- Both menus are lifted to the body. Each stands alone in a block of its
     own, so it is the only node Svelte removes for it. -->
{#snippet first()}
  <!-- svelte-ignore a11y_interactive_supports_focus, a11y_mouse_events_have_key_events -->
  <div
    {@attach lift}
    data-glim="ContextMenu"
    bind:this={menu}
    role="menu"
    {id}
    aria-label={label}
    class="glim-menu"
    style={px(pos)}
    onkeydown={(e) => keys(e, false)}
    onmouseover={hover}
    oncontextmenu={(e) => e.preventDefault()}
  >
    <MenuRows entries={rows} openAt={sub?.at} onPick={(i) => pick(rows, i)} />
  </div>
{/snippet}
{@render first()}
{#if subRows}
  {@const list = subRows}
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    {@attach lift}
    bind:this={subMenu}
    id={host?.subId}
    role="menu"
    aria-label={host?.label}
    class="glim-menu"
    style={px(subPos ?? { left: 0, top: 0 })}
    onkeydown={(e) => keys(e, true)}
    oncontextmenu={(e) => e.preventDefault()}
  >
    <MenuRows entries={list} onPick={(i) => pick(list, i)} />
  </div>
{/if}
