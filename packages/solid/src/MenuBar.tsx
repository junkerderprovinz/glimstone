// The menu bar of a desktop-style app: a row of words, each opening its menu
// below it. While one is open the pointer and the arrow keys move between
// them, as in a desktop program. The app opens the first one on F10 through
// the ref, since which key does it is the app's keymap.

import { createSignal, For, Index } from "solid-js";
import type { MenuBarHandle } from "@glimstone/core";
import { ContextMenu, type MenuEntry } from "./ContextMenu.tsx";

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
  ref?: MenuBarHandle | ((handle: MenuBarHandle) => void);
  class?: string;
}

export function MenuBar(props: MenuBarProps) {
  const buttons: (HTMLButtonElement | undefined)[] = [];
  const [open, setOpen] = createSignal<{ at: number; x: number; y: number; fromEnd: boolean } | null>(null);
  const [stop, setStop] = createSignal(0);
  const count = () => props.menus.length;

  function show(at: number, fromEnd = false) {
    const button = buttons[at];
    if (!button) return;
    button.focus();
    setStop(at);
    const r = button.getBoundingClientRect();
    setOpen({ at, x: r.left, y: r.bottom + 6, fromEnd });
  }
  if (typeof props.ref === "function") props.ref({ open: (at: number) => show(at) });

  function keys(e: KeyboardEvent & { currentTarget: HTMLButtonElement }, at: number) {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = ({ ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 } as Record<string, number | undefined>)[e.key];
    const to = step !== undefined ? (at + step + count()) % count() : ({ Home: 0, End: count() - 1 } as Record<string, number | undefined>)[e.key];
    if (to !== undefined) {
      e.preventDefault();
      setStop(to);
      buttons[to]?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      show(at, e.key === "ArrowUp");
    }
  }

  return (
    <div data-glim="MenuBar" role="menubar" aria-label={props.label} class={props.class ? `glim-menubar ${props.class}` : "glim-menubar"}>
      <Index each={props.menus}>
        {(m, i) => (
          <button
            ref={(el) => (buttons[i] = el)}
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open()?.at === i}
            tabIndex={i === stop() ? 0 : -1}
            class="glim-menubar-item"
            onClick={() => (open()?.at === i ? setOpen(null) : show(i))}
            onMouseEnter={() => open() && open()!.at !== i && show(i)}
            onKeyDown={(e) => keys(e, i)}
            onFocus={() => setStop(i)}
          >
            {m().label}
          </button>
        )}
      </Index>
      {/* Keyed by the menu's index, so moving to another word opens a fresh menu. */}
      <For each={open() && props.menus[open()!.at] ? [open()!.at] : []}>
        {(at) => (
          <ContextMenu
            x={open()!.x}
            y={open()!.y}
            items={props.menus[at]!.items}
            label={props.menus[at]!.label}
            id={props.menus[at]!.id}
            opener={buttons[at]}
            onClose={() => setOpen(null)}
            onStep={(d) => show((at + d + count()) % count())}
            fromEnd={open()!.fromEnd}
          />
        )}
      </For>
    </div>
  );
}
