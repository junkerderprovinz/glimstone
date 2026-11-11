// A menu at a point: a right-click on a row, the More button of a list, or a
// menu of the bar. Mount it to open it and unmount it on onClose. The model,
// the placing and the keys come from menu.ts in the core.
//
// A submenu opens beside its row as a second menu on the body, one level deep.
// A checkbox item leaves the menu open, so several can be ticked in a row; the
// caller flips `checked` and the row follows.

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  claimMenu,
  closeMenuOutside,
  focusedAsker,
  focusFirstMenuRow,
  focusMenuRow,
  isMenuHead,
  menuMove,
  menuRowView,
  placeMenu,
  placeSubmenu,
  returnFocus,
  tidyMenu,
  type MenuEntry as CoreMenuEntry,
  type MenuHead as CoreMenuHead,
  type MenuItem as CoreMenuItem,
} from "@glimstone/core";
import { IconCheck, IconExpand, IconPencil } from "./glyphs.tsx";
import { Kbd } from "./Kbd.tsx";
import { useTipBubble } from "./useTipBubble.tsx";

export type MenuEntry = CoreMenuEntry<ReactNode>;
export type MenuItem = CoreMenuItem<ReactNode>;
export type MenuHead = CoreMenuHead<ReactNode>;

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
}

const viewport = () => ({ width: innerWidth, height: innerHeight });

function HeadEdit({ tip, glyph, row, onPress }: { tip: string; glyph?: ReactNode; row: number; onPress: () => void }) {
  const tooltip = useTipBubble(tip);
  return (
    <>
      <button
        ref={tooltip.ref}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-label={tip}
        aria-describedby={tooltip.describedBy}
        {...tooltip.handlers}
        className="glim-menu-head-edit"
        data-row={row}
        onClick={onPress}
      >
        {glyph ?? <IconPencil />}
      </button>
      {tooltip.bubble}
    </>
  );
}

function Rows({
  entries,
  openAt,
  onPick,
}: {
  entries: MenuEntry[];
  openAt?: number;
  onPick: (row: number) => void;
}) {
  return entries.map((entry, i) => {
    if (entry === "-") return <div key={i} className="glim-menu-sep" role="separator" />;
    if (isMenuHead(entry)) {
      return (
        <div key={i} className="glim-menu-head" role="presentation">
          <span>{entry.head}</span>
          {entry.edit && <HeadEdit tip={entry.edit.tip} glyph={entry.edit.glyph} row={i} onPress={() => onPick(i)} />}
        </div>
      );
    }
    const view = menuRowView(entry);
    return (
      <button
        key={i}
        type="button"
        role={view.role}
        tabIndex={-1}
        aria-checked={view.role === "menuitem" ? undefined : entry.checked}
        aria-haspopup={entry.sub ? "menu" : undefined}
        aria-expanded={entry.sub ? openAt === i : undefined}
        disabled={entry.disabled}
        className={view.current ? "glim-menu-item glim-menu-item--current" : "glim-menu-item"}
        data-row={i}
        onClick={() => onPick(i)}
      >
        {view.lead === "box" ? (
          <span className="glim-checkbox-box" aria-hidden="true">
            <IconCheck />
          </span>
        ) : view.lead === "dot" ? (
          <span className="glim-menu-dot" style={{ backgroundColor: entry.color }} aria-hidden="true" />
        ) : (
          <span className="glim-menu-glyph" aria-hidden="true">
            {view.lead === "glyph" && entry.glyph}
          </span>
        )}
        <span className="glim-menu-label">{entry.label}</span>
        {view.end === "submenu" && (
          <span className="glim-menu-end glim-menu-caret" aria-hidden="true">
            <IconExpand />
          </span>
        )}
        {view.end === "tick" && (
          <span className="glim-menu-end glim-menu-tick" aria-hidden="true">
            <IconCheck />
          </span>
        )}
        {view.end === "shortcut" && <Kbd className="glim-menu-end">{entry.shortcut}</Kbd>}
        {view.end === "count" && <span className="glim-menu-end glim-menu-count glim-num">{entry.count}</span>}
      </button>
    );
  });
}

export function ContextMenu({ x, y, items, above = false, label, id, opener, onClose, onStep }: ContextMenuProps) {
  const menu = useRef<HTMLDivElement>(null);
  const subMenu = useRef<HTMLDivElement>(null);
  const [asker] = useState(focusedAsker);
  const [pos, setPos] = useState({ left: x, top: y });
  const [sub, setSub] = useState<{ at: number; focus: boolean } | null>(null);
  const [subPos, setSubPos] = useState<{ left: number; top: number } | null>(null);
  const latest = useRef({ onClose, onStep, opener });
  useLayoutEffect(() => {
    latest.current = { onClose, onStep, opener };
  });

  const rows = tidyMenu(items);
  const host = sub ? rows[sub.at] : undefined;
  const subRows = host && !isMenuHead(host) && host !== "-" && host.sub ? tidyMenu(host.sub) : null;

  // Focus goes back only on a way out somebody chose; a click elsewhere keeps
  // the focus it gave. It reads only refs, so the first render's copy serves
  // the listeners too.
  const finish = (handBack: boolean) => {
    latest.current.onClose();
    if (handBack) returnFocus(latest.current.opener ?? asker);
  };

  useLayoutEffect(() => {
    const el = menu.current!;
    setPos(placeMenu(x, y, { width: el.offsetWidth, height: el.offsetHeight }, viewport(), above));
  }, [x, y, above]);

  useLayoutEffect(() => {
    const release = claimMenu(finish);
    const outside = closeMenuOutside(
      () => [menu.current, subMenu.current, latest.current.opener],
      () => finish(false),
    );
    focusFirstMenuRow(menu.current!);
    return () => {
      release();
      outside();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const row = sub && menu.current?.querySelector(`[data-row="${sub.at}"]`);
    if (!sub || !row || !subMenu.current) {
      setSubPos(null);
      return;
    }
    const rtl = getComputedStyle(menu.current!).direction === "rtl";
    const el = subMenu.current;
    setSubPos(placeSubmenu(row.getBoundingClientRect(), { width: el.offsetWidth, height: el.offsetHeight }, viewport(), rtl));
    if (sub.focus) focusFirstMenuRow(el);
  }, [sub]);

  function pick(list: MenuEntry[], at: number) {
    const entry = list[at]!;
    if (entry === "-") return;
    if (isMenuHead(entry)) {
      finish(true);
      entry.edit?.onSelect();
      return;
    }
    if (entry.sub && list === rows) {
      setSub({ at, focus: true });
      return;
    }
    if (menuRowView(entry).staysOpen) {
      entry.onSelect?.();
      return;
    }
    finish(true);
    entry.onSelect?.();
  }

  function keys(e: KeyboardEvent<HTMLDivElement>, inSub: boolean) {
    if (e.key === "Tab") return finish(false);
    const move = menuMove(e.key, getComputedStyle(e.currentTarget).direction === "rtl");
    if (!move) return;
    e.preventDefault();
    if (move !== "in" && move !== "out") return focusMenuRow(e.currentTarget, move);
    if (inSub) {
      if (move === "out" && sub) {
        menu.current?.querySelector<HTMLElement>(`[data-row="${sub.at}"]`)?.focus();
        setSub(null);
      }
      return;
    }
    const at = Number((document.activeElement as HTMLElement | null)?.dataset.row);
    const entry = rows[at];
    if (move === "in" && entry && entry !== "-" && !isMenuHead(entry) && entry.sub && !entry.disabled) setSub({ at, focus: true });
    else latest.current.onStep?.(move === "in" ? 1 : -1);
  }

  // The pointer opens a submenu by resting on its row and closes it on any other row.
  function hover(e: MouseEvent<HTMLDivElement>) {
    const row = (e.target as Element).closest<HTMLElement>("[data-row]");
    if (!row) return;
    const at = Number(row.dataset.row);
    const entry = rows[at]!;
    const opens = entry !== "-" && !isMenuHead(entry) && !!entry.sub && !entry.disabled;
    if (opens && sub?.at !== at) setSub({ at, focus: false });
    else if (!opens && sub) setSub(null);
  }

  return (
    <>
      {createPortal(
        <div
          data-glim="ContextMenu"
          ref={menu}
          role="menu"
          id={id}
          aria-label={label}
          className="glim-menu"
          style={pos}
          onKeyDown={(e) => keys(e, false)}
          onMouseOver={hover}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Rows entries={rows} openAt={sub?.at} onPick={(i) => pick(rows, i)} />
        </div>,
        document.body,
      )}
      {subRows &&
        createPortal(
          <div
            ref={subMenu}
            id={(host as MenuItem).subId}
            role="menu"
            aria-label={(host as MenuItem).label}
            className="glim-menu"
            style={subPos ?? { left: 0, top: 0 }}
            onKeyDown={(e) => keys(e, true)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Rows entries={subRows} onPick={(i) => pick(subRows, i)} />
          </div>,
          document.body,
        )}
    </>
  );
}
