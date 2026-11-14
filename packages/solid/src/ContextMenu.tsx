// A menu at a point: a right-click on a row, the More button of a list, or a
// menu of the bar. Mount it to open it and unmount it on onClose. The model,
// the placing and the keys come from menu.ts in the core.
//
// A submenu opens beside its row as a second menu on the body, one level deep.
// A checkbox item leaves the menu open, so several can be ticked in a row; the
// caller flips `checked` and the row follows.

import { createEffect, createMemo, createSignal, Index, Match, mergeProps, onCleanup, onMount, Show, Switch, type JSX } from "solid-js";
import {
  claimMenu,
  closeMenuOutside,
  focusedAsker,
  focusFirstMenuRow,
  focusMenuRow,
  focusMenuRowByLetter,
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
import { Lift } from "./Lift.tsx";
import { useTipBubble } from "./useTipBubble.tsx";

export type MenuEntry = CoreMenuEntry<JSX.Element>;
export type MenuItem = CoreMenuItem<JSX.Element>;
export type MenuHead = CoreMenuHead<JSX.Element>;

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

const viewport = () => ({ width: innerWidth, height: innerHeight });
const px = (at: { left: number; top: number }) => ({ left: `${at.left}px`, top: `${at.top}px` });
const opensSub = (entry: MenuEntry | undefined): entry is MenuItem => !!entry && entry !== "-" && !isMenuHead(entry) && !!entry.sub;

function HeadEdit(props: { tip: string; glyph?: JSX.Element; row: number; onPress: () => void }) {
  const tooltip = useTipBubble(() => props.tip);
  return (
    <>
      <button
        ref={tooltip.ref}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-label={props.tip}
        aria-describedby={tooltip.describedBy()}
        onMouseEnter={tooltip.handlers.onMouseEnter}
        onMouseLeave={tooltip.handlers.onMouseLeave}
        onFocus={tooltip.handlers.onFocus}
        onBlur={tooltip.handlers.onBlur}
        class="glim-menu-head-edit"
        data-row={props.row}
        onClick={() => props.onPress()}
      >
        {props.glyph ?? <IconPencil />}
      </button>
      {tooltip.bubble}
    </>
  );
}

function ItemRow(props: { entry: MenuItem; row: number; openAt?: number; onPick: () => void }) {
  const view = createMemo(() => menuRowView(props.entry));
  return (
    <button
      type="button"
      role={view().role}
      tabIndex={-1}
      aria-checked={view().role === "menuitem" ? undefined : props.entry.checked}
      aria-haspopup={props.entry.sub ? "menu" : undefined}
      aria-expanded={props.entry.sub ? props.openAt === props.row : undefined}
      disabled={props.entry.disabled}
      class={view().current ? "glim-menu-item glim-menu-item--current" : "glim-menu-item"}
      data-row={props.row}
      onClick={() => props.onPick()}
    >
      <Switch
        fallback={
          <span class="glim-menu-glyph" aria-hidden="true">
            {view().lead === "glyph" && props.entry.glyph}
          </span>
        }
      >
        <Match when={view().lead === "box"}>
          <span class="glim-checkbox-box" aria-hidden="true">
            <IconCheck />
          </span>
        </Match>
        <Match when={view().lead === "dot"}>
          <span class="glim-menu-dot" style={{ "background-color": props.entry.color }} aria-hidden="true" />
        </Match>
      </Switch>
      <span class="glim-menu-label">{props.entry.label}</span>
      <Show when={view().end === "submenu"}>
        <span class="glim-menu-end glim-menu-caret" aria-hidden="true">
          <IconExpand />
        </span>
      </Show>
      <Show when={view().end === "tick"}>
        <span class="glim-menu-end glim-menu-tick" aria-hidden="true">
          <IconCheck />
        </span>
      </Show>
      <Show when={view().end === "shortcut"}>
        <Kbd class="glim-menu-end">{props.entry.shortcut}</Kbd>
      </Show>
      <Show when={view().end === "count"}>
        <span class="glim-menu-end glim-menu-count glim-num">{props.entry.count}</span>
      </Show>
    </button>
  );
}

// Rows keep their elements while the entries change, so a ticked checkbox
// keeps the focus.
function Rows(props: { entries: MenuEntry[]; openAt?: number; onPick: (row: number) => void }) {
  return (
    <Index each={props.entries}>
      {(entry, i) => {
        const head = () => {
          const e = entry();
          return e !== "-" && isMenuHead(e) ? e : undefined;
        };
        const item = () => {
          const e = entry();
          return e !== "-" && !isMenuHead(e) ? e : undefined;
        };
        return (
          <Switch fallback={<div class="glim-menu-sep" role="separator" />}>
            <Match when={head()}>
              {(h) => (
                <div class="glim-menu-head" role="presentation">
                  <span>{h().head}</span>
                  <Show when={h().edit}>{(edit) => <HeadEdit tip={edit().tip} glyph={edit().glyph} row={i} onPress={() => props.onPick(i)} />}</Show>
                </div>
              )}
            </Match>
            <Match when={item()}>{(it) => <ItemRow entry={it()} row={i} openAt={props.openAt} onPick={() => props.onPick(i)} />}</Match>
          </Switch>
        );
      }}
    </Index>
  );
}

export function ContextMenu(props: ContextMenuProps) {
  const merged = mergeProps({ above: false, fromEnd: false }, props);
  let menu!: HTMLDivElement;
  let subMenu: HTMLDivElement | undefined;
  const asker = focusedAsker();
  const [pos, setPos] = createSignal({ left: merged.x, top: merged.y });
  const [sub, setSub] = createSignal<{ at: number; focus: boolean } | null>(null);
  const [subPos, setSubPos] = createSignal<{ left: number; top: number } | null>(null);

  const rows = createMemo(() => tidyMenu(merged.items));
  const host = createMemo(() => {
    const s = sub();
    const entry = s ? rows()[s.at] : undefined;
    return opensSub(entry) ? entry : undefined;
  });
  const subRows = createMemo(() => {
    const entries = host()?.sub;
    return entries ? tidyMenu(entries) : null;
  });

  // Focus goes back only on a way out somebody chose; a click elsewhere keeps
  // the focus it gave. The opener is read first, since closing unmounts the
  // menu and the caller may forget it.
  const finish = (handBack: boolean) => {
    const back = merged.opener ?? asker;
    merged.onClose();
    if (handBack) returnFocus(back);
  };

  createEffect(() => {
    setPos(placeMenu(merged.x, merged.y, { width: menu.offsetWidth, height: menu.offsetHeight }, viewport(), merged.above));
  });

  onMount(() => {
    const release = claimMenu(finish);
    const outside = closeMenuOutside(
      () => [menu, subMenu, merged.opener],
      () => finish(false),
    );
    if (merged.fromEnd) focusMenuRow(menu, "last");
    else focusFirstMenuRow(menu);
    onCleanup(() => {
      release();
      outside();
    });
  });

  createEffect(() => {
    const s = sub();
    const row = s && subRows() && menu.querySelector(`[data-row="${s.at}"]`);
    if (!s || !row || !subMenu) {
      setSubPos(null);
      return;
    }
    const rtl = getComputedStyle(menu).direction === "rtl";
    setSubPos(placeSubmenu(row.getBoundingClientRect(), { width: subMenu.offsetWidth, height: subMenu.offsetHeight }, viewport(), rtl));
    if (s.focus) focusFirstMenuRow(subMenu);
  });

  function pick(list: MenuEntry[], at: number) {
    const entry = list[at]!;
    if (entry === "-") return;
    if (isMenuHead(entry)) {
      finish(true);
      entry.edit?.onSelect();
      return;
    }
    if (entry.sub && list === rows()) {
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

  // A letter typed in the menu, which jumps to a row; Space presses the row.
  const typed = (e: KeyboardEvent) => e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey;

  function keys(e: KeyboardEvent & { currentTarget: HTMLDivElement }, inSub: boolean) {
    if (e.key === "Tab") return finish(false);
    if (typed(e)) {
      if (focusMenuRowByLetter(e.currentTarget, e.key)) e.preventDefault();
      return;
    }
    const move = menuMove(e.key, getComputedStyle(e.currentTarget).direction === "rtl");
    if (!move) return;
    e.preventDefault();
    if (move !== "in" && move !== "out") return focusMenuRow(e.currentTarget, move);
    if (inSub) {
      const s = sub();
      if (move === "out" && s) {
        menu.querySelector<HTMLElement>(`[data-row="${s.at}"]`)?.focus();
        setSub(null);
      }
      return;
    }
    const at = Number((document.activeElement as HTMLElement | null)?.dataset.row);
    const entry = rows()[at];
    if (move === "in" && opensSub(entry) && !entry.disabled) setSub({ at, focus: true });
    else merged.onStep?.(move === "in" ? 1 : -1);
  }

  // The pointer opens a submenu by resting on its row and closes it on any other row.
  function hover(e: MouseEvent) {
    const row = (e.target as Element).closest<HTMLElement>("[data-row]");
    if (!row) return;
    const at = Number(row.dataset.row);
    const entry = rows()[at];
    const opens = opensSub(entry) && !entry.disabled;
    if (opens && sub()?.at !== at) setSub({ at, focus: false });
    else if (!opens && sub()) setSub(null);
  }

  return (
    <>
      <Lift>
        <div
          data-glim="ContextMenu"
          ref={menu}
          role="menu"
          id={merged.id}
          aria-label={merged.label}
          class="glim-menu"
          style={px(pos())}
          onKeyDown={(e) => keys(e, false)}
          onMouseOver={hover}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Rows entries={rows()} openAt={sub()?.at} onPick={(i) => pick(rows(), i)} />
        </div>
      </Lift>
      <Show when={subRows()}>
        {(list) => (
          <Lift>
            <div
              ref={subMenu}
              id={host()?.subId}
              role="menu"
              aria-label={host()?.label}
              class="glim-menu"
              style={px(subPos() ?? { left: 0, top: 0 })}
              onKeyDown={(e) => keys(e, true)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <Rows entries={list()} onPick={(i) => pick(list(), i)} />
            </div>
          </Lift>
        )}
      </Show>
    </>
  );
}
