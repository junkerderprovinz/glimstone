<script lang="ts" module>
  import type { Snippet } from "svelte";

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
    children: Snippet;
  }
</script>

<script lang="ts">
  import { tick } from "svelte";
  import { computeBubblePosition } from "@glimstone/core";
  import { lift } from "./lift.js";
  import { usePortalHue } from "./portalHue.svelte.js";
  import { css } from "./style.js";

  // The `role="listbox"` panel a button-opens-a-list picker drops open. It is
  // lifted to the portal target, because a card with `overflow: hidden` clips
  // an absolutely positioned panel whatever its z-index, and placed with
  // computeBubblePosition, which clamps it into the viewport and flips it above
  // the trigger when needed. The panel takes the trigger's width and is centred
  // on it with `translateX(-50%)`, since computeBubblePosition returns the
  // centre.
  //
  // Kept for the apps that already use it; Select keeps focus on its trigger
  // and adds typeahead.
  let { open, onClose, triggerRef, label, multiselectable, children }: DropdownListboxProps = $props();

  /** The gap to the trigger and the least distance from the viewport's edge, 4px to match `mt-1`. */
  const GAP = 4;

  let panel = $state<HTMLDivElement | null>(null);
  let pos = $state<{ left: number; top: number; width: number } | null>(null);
  // The portal leaves the trigger's rainbow subtree, so the panel copies the
  // trigger's hue.
  const hue = usePortalHue(() => open, () => triggerRef);
  // Whether focus is inside the panel, tracked as it moves because it cannot be
  // read once the panel is gone.
  let focusInside = false;

  const options = () => [...(panel?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];

  function place(el: HTMLDivElement, trigger: HTMLElement) {
    const rect = trigger.getBoundingClientRect();
    // Option labels wrap against the width, so it is set before the height is read.
    el.style.width = `${rect.width}px`;
    const viewport = {
      width: document.documentElement.clientWidth || window.innerWidth,
      height: document.documentElement.clientHeight || window.innerHeight,
    };
    const { left, top } = computeBubblePosition(rect, { width: rect.width, height: el.offsetHeight }, viewport, GAP);
    pos = { left, top, width: rect.width };
  }

  // A fixed panel that has lost its trigger reads as broken, so an outside
  // press, Escape, scroll or resize closes it. The panel itself is exempt from
  // the outside press, or pressing an option would unmount the list before its
  // click landed. A scroll inside the panel, which scrolls a long list itself,
  // does not close it either.
  $effect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panel?.contains(target) || triggerRef?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && panel?.contains(e.target)) return;
      onClose();
    };
    const onResize = () => onClose();
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  });

  // Measured and placed before paint, so the panel never jumps from its
  // off-screen parking spot. Focus then moves to the selected option, so a
  // keyboard user reaches the list, but only once the panel stands at its real
  // place: focusing an option parked off-screen makes the browser scroll to
  // it, and that scroll closes the list.
  $effect.pre(() => {
    if (!open) {
      pos = null;
      // Focus goes back to the trigger only if it was in the list; a press
      // elsewhere has already put it where somebody wants it.
      if (focusInside) triggerRef?.focus();
      focusInside = false;
      return;
    }
    if (!panel || !triggerRef) return;
    place(panel, triggerRef);
    tick().then(() => {
      const opts = options();
      const active = opts.find((o) => o.getAttribute("aria-selected") === "true") ?? opts[0];
      active?.scrollIntoView?.({ block: "nearest" });
      active?.focus();
    });
  });

  // Arrows, Home and End move between the options so every listbox behaves
  // alike. Enter and Space need nothing: the options are real buttons.
  function onPanelKey(e: KeyboardEvent) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
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
    opts[next]!.scrollIntoView?.({ block: "nearest" });
    opts[next]!.focus();
  }

  function onFocusOut(e: FocusEvent) {
    // Focus that goes nowhere, as when the panel leaves the page, still counts as inside.
    const to = e.relatedTarget as Node | null;
    if (to && !panel?.contains(to)) focusInside = false;
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_interactive_supports_focus -->
  <div
    {@attach lift}
    bind:this={panel}
    data-glim="DropdownListbox"
    role="listbox"
    onkeydown={onPanelKey}
    onfocusin={() => (focusInside = true)}
    onfocusout={onFocusOut}
    aria-multiselectable={multiselectable ? "true" : undefined}
    aria-label={label}
    class={`glim-listbox glim-fade${hue.className ? ` ${hue.className}` : ""}`}
    style:left={`${pos?.left ?? -9999}px`}
    style:top={`${pos?.top ?? -9999}px`}
    style:width={pos ? `${pos.width}px` : undefined}
    style:transform="translateX(-50%)"
    style={css(hue.style)}
  >
    {@render children()}
  </div>
{/if}
