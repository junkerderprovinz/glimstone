import { children, createEffect, createSignal, on, onCleanup, onMount, Show, type JSX } from "solid-js";
import { computeBubblePosition, focusByLetter, isTypeahead } from "@glimstone/core";
import { Lift } from "./Lift.tsx";
import { usePortalHue, type PortalHue } from "./portalHue.ts";
import { css } from "./style.ts";

// The `role="listbox"` panel a button-opens-a-list picker drops open. It is
// lifted to the portal target, because a card with `overflow: hidden` clips an
// absolutely positioned panel whatever its z-index, and placed with
// computeBubblePosition, which clamps it into the viewport and flips it above
// the trigger when needed.
//
// The panel takes the trigger's width and is centred on it with
// `translateX(-50%)`, since computeBubblePosition returns the centre. Equal
// widths look start-aligned and need no RTL branch.

/** The gap to the trigger and the minimum distance from the viewport edge,
 *  4px to match `mt-1`. */
const DROPDOWN_GAP = 4;

export interface DropdownListboxProps {
  /** Whether the panel is mounted. The caller owns the trigger; only the
   *  panel is shared. */
  open: boolean;
  /** Called when the panel dismisses itself (outside click, Escape, scroll,
   *  resize). Picking an option does not call it: a single-select list closes
   *  itself at the call site, a multi-select one stays open. */
  onClose: () => void;
  /** The trigger, which anchors the panel and is exempt from the outside-click
   *  dismissal so clicking it does not close and reopen the list. */
  triggerRef: HTMLElement | null | undefined;
  /** Accessible name for the listbox, normally the same label the trigger
   *  carries. */
  label: string;
  /** `aria-multiselectable`, for a checkbox multi-select list. */
  multiselectable?: boolean;
  /** The `role="option"` buttons. */
  children: JSX.Element;
}

/** @deprecated Use Select, which keeps focus on its trigger and adds typeahead. */
export function DropdownListbox(props: DropdownListboxProps) {
  // The portal leaves the trigger's rainbow subtree, so the panel copies the
  // trigger's hue.
  const hue = usePortalHue(() => props.open, () => props.triggerRef);
  // Whether focus was in the list as it closed. The panel reads it while it
  // still stands in the page: a browser that blurs a removed element reports
  // the focus gone before the list is.
  let focusWasInside = false;

  // Focus returns to the trigger on close only if it was inside the panel; a
  // click elsewhere has already put it where the user wants.
  createEffect(
    on(
      () => props.open,
      (open) => {
        if (open) return;
        if (focusWasInside) props.triggerRef?.focus();
        focusWasInside = false;
      },
      { defer: true },
    ),
  );

  return (
    <Show when={props.open}>
      <Panel
        {...props}
        hue={hue}
        leaving={(inside) => (focusWasInside = inside)}
      />
    </Show>
  );
}

function Panel(
  props: DropdownListboxProps & {
    hue: PortalHue;
    leaving: (focusInside: boolean) => void;
  },
) {
  let panel!: HTMLDivElement;
  const [pos, setPos] = createSignal<{ left: number; top: number; width: number } | null>(null);
  const resolved = children(() => props.children);
  let focusedOnOpen = false;

  // The options are the caller's children, so they are found in the DOM by
  // their role.
  const options = () => Array.from(panel.querySelectorAll<HTMLElement>('[role="option"]'));

  // Measured and placed before paint, so the panel never jumps from its
  // off-screen parking spot. The children are read so a list that changes
  // length while open is measured again.
  createEffect(() => {
    resolved();
    const trigger = props.triggerRef;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    // The width is written to the node before the height is read, because
    // option labels wrap against it.
    panel.style.width = `${rect.width}px`;
    const viewport = {
      width: document.documentElement.clientWidth || window.innerWidth,
      height: document.documentElement.clientHeight || window.innerHeight,
    };
    const { left, top } = computeBubblePosition(rect, { width: rect.width, height: panel.offsetHeight }, viewport, DROPDOWN_GAP);
    const prev = pos();
    if (!prev || prev.left !== left || prev.top !== top || prev.width !== rect.width) setPos({ left, top, width: rect.width });
  });

  // Focus moves to the selected option on open, so a keyboard user reaches the
  // list. It waits for `pos`: focusing an option parked at -9999px makes the
  // browser scroll to it, and that scroll closes the panel.
  createEffect(() => {
    if (!pos() || focusedOnOpen) return;
    const opts = options();
    if (opts.length === 0) return;
    const active = opts.find((o) => o.getAttribute("aria-selected") === "true") ?? opts[0]!;
    focusedOnOpen = true;
    active.scrollIntoView?.({ block: "nearest" });
    active.focus();
  });

  // A fixed panel that has lost its trigger reads as broken, so an outside
  // press, Escape, scroll or resize closes it. The panel itself is exempt from
  // the outside press, or pressing an option would unmount the list before its
  // click landed. The scroll listener captures on `window` to see nested
  // scroll containers, and ignores scrolls inside the panel, which scrolls a
  // long list itself.
  onMount(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panel.contains(target) || props.triggerRef?.contains(target)) return;
      props.onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && panel.contains(e.target)) return;
      props.onClose();
    };
    const onResize = () => props.onClose();
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    onCleanup(() => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    });
  });

  // Arrows, Home, End and a typed letter move between options here so every
  // listbox behaves alike. Enter and Space need nothing: the options are real
  // buttons.
  const onPanelKeyDown = (e: KeyboardEvent) => {
    if (isTypeahead(e)) {
      if (focusByLetter(options(), e.key)) e.preventDefault();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    const opts = options();
    if (opts.length === 0) return;
    e.preventDefault();
    const at = opts.indexOf(document.activeElement as HTMLElement);
    let next: number;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = opts.length - 1;
    else {
      const dir = e.key === "ArrowDown" ? 1 : -1;
      next = at < 0 ? (dir === 1 ? 0 : opts.length - 1) : (at + dir + opts.length) % opts.length;
    }
    const option = opts[next]!;
    option.scrollIntoView?.({ block: "nearest" });
    option.focus();
  };

  return (
    <Lift onLeave={() => props.leaving(panel.contains(document.activeElement))}>
      <div
        data-glim="DropdownListbox"
        ref={panel}
        role="listbox"
        onKeyDown={onPanelKeyDown}
        aria-multiselectable={props.multiselectable ? "true" : undefined}
        aria-label={props.label}
        class={`glim-listbox glim-fade${props.hue.className() ? ` ${props.hue.className()}` : ""}`}
        style={{
          // Parked off-screen until measured, since the panel needs to be in
          // the DOM at its real width to have a height.
          left: `${pos()?.left ?? -9999}px`,
          top: `${pos()?.top ?? -9999}px`,
          width: pos() ? `${pos()!.width}px` : undefined,
          transform: "translateX(-50%)",
          ...css(props.hue.style()),
        }}
      >
        {resolved()}
      </div>
    </Lift>
  );
}
