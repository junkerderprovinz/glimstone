// The menu bar of a desktop-style app: a row of words, each opening its menu
// below it. While one is open the pointer and the arrow keys move between
// them, as in a desktop program. The app opens the first one on F10 through
// the ref, since which key does it is the app's keymap.

import { useImperativeHandle, useRef, useState, type KeyboardEvent, type Ref } from "react";
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
  ref?: Ref<MenuBarHandle>;
  className?: string;
}

export function MenuBar({ label, menus, ref, className }: MenuBarProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<{ at: number; x: number; y: number; fromEnd: boolean } | null>(null);
  const [stop, setStop] = useState(0);
  const count = menus.length;

  function show(at: number, fromEnd = false) {
    const button = buttons.current[at];
    if (!button) return;
    button.focus();
    setStop(at);
    const r = button.getBoundingClientRect();
    setOpen({ at, x: r.left, y: r.bottom + 6, fromEnd });
  }
  useImperativeHandle(ref, () => ({ open: (at: number) => show(at) }));

  function keys(e: KeyboardEvent<HTMLButtonElement>, at: number) {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    const to = step !== undefined ? (at + step + count) % count : ({ Home: 0, End: count - 1 } as Record<string, number | undefined>)[e.key];
    if (to !== undefined) {
      e.preventDefault();
      setStop(to);
      buttons.current[to]?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      show(at, e.key === "ArrowUp");
    }
  }

  return (
    <div data-glim="MenuBar" role="menubar" aria-label={label} className={className ? `glim-menubar ${className}` : "glim-menubar"}>
      {menus.map((m, i) => (
        <button
          key={i}
          ref={(el) => {
            buttons.current[i] = el;
          }}
          type="button"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={open?.at === i}
          tabIndex={i === stop ? 0 : -1}
          className="glim-menubar-item"
          onClick={() => (open?.at === i ? setOpen(null) : show(i))}
          onMouseEnter={() => open && open.at !== i && show(i)}
          onKeyDown={(e) => keys(e, i)}
          onFocus={() => setStop(i)}
        >
          {m.label}
        </button>
      ))}
      {open && menus[open.at] && (
        <ContextMenu
          key={open.at}
          x={open.x}
          y={open.y}
          items={menus[open.at]!.items}
          label={menus[open.at]!.label}
          id={menus[open.at]!.id}
          opener={buttons.current[open.at]}
          onClose={() => setOpen(null)}
          onStep={(d) => show((open.at + d + count) % count)}
          fromEnd={open.fromEnd}
        />
      )}
    </div>
  );
}
