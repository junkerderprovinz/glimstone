// What a Popover and a Sheet do with the browser's top layer. A popover is an
// element with the popover attribute: the browser closes it on Escape and on a
// press beside it, and it needs no portal, since nothing clips the top layer.
// A sheet is a <dialog> shown modal, which makes the page behind it inert.

import { computeBubblePosition } from "./bubblePosition.ts";
import { focusedAsker, keepTabInside, returnFocus } from "./dialog.ts";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Whether the browser ties an element to another with CSS anchor positioning. */
export function anchorSupported(): boolean {
  return typeof CSS !== "undefined" && CSS.supports("anchor-name: --a");
}

/** A dashed ident for an anchor, from an id such as React's useId(). */
export function anchorName(id: string): string {
  return `--glim-anchor-${id.replace(/[^\w-]/g, "")}`;
}

/** The open modal sheet in front, where a menu or a bubble opened from inside
 *  it has to render, since <body> lies under the top layer; <body> otherwise. */
export function portalTarget(): HTMLElement {
  const sheets = document.querySelectorAll<HTMLElement>("dialog.glim-sheet[open]");
  return sheets[sheets.length - 1] ?? document.body;
}

/** Whether a popover is open, so a window leaves Escape to it. */
export function popoverIsOpen(): boolean {
  return !!document.querySelector(".glim-popover:popover-open");
}

/**
 * Shows a popover beside its anchor and moves focus into it. `onClose` runs
 * when the browser closes it, on Escape or a press beside it, and focus goes
 * back to the anchor, or to the control inside it when the anchor is a box. Returns the cleanup, which hides it if it is still open.
 */
export function openPopover(popover: HTMLElement, anchor: HTMLElement, name: string, onClose: () => void): () => void {
  let unplace: () => void;
  if (anchorSupported()) {
    anchor.style.setProperty("anchor-name", name);
    popover.style.setProperty("position-anchor", name);
    unplace = () => anchor.style.removeProperty("anchor-name");
  } else {
    const place = () => {
      const r = anchor.getBoundingClientRect();
      const at = computeBubblePosition(r, { width: popover.offsetWidth, height: popover.offsetHeight }, { width: innerWidth, height: innerHeight });
      popover.style.left = `${at.left - popover.offsetWidth / 2}px`;
      popover.style.top = `${at.top}px`;
    };
    addEventListener("scroll", place, true);
    addEventListener("resize", place);
    unplace = () => {
      removeEventListener("scroll", place, true);
      removeEventListener("resize", place);
    };
    popover.showPopover();
    place();
  }
  if (!popover.matches(":popover-open")) popover.showPopover();
  const first = popover.querySelector<HTMLElement>(FOCUSABLE);
  if (first) first.focus();
  else {
    popover.tabIndex = -1;
    popover.focus();
  }
  const onToggle = (e: Event) => {
    if ((e as ToggleEvent).newState !== "closed") return;
    const active = document.activeElement;
    if (!active || active === document.body || popover.contains(active)) (anchor.matches(FOCUSABLE) ? anchor : anchor.querySelector<HTMLElement>(FOCUSABLE) ?? anchor).focus();
    onClose();
  };
  popover.addEventListener("toggle", onToggle);
  return () => {
    popover.removeEventListener("toggle", onToggle);
    unplace();
    if (popover.matches(":popover-open")) popover.hidePopover();
  };
}

/**
 * Shows a sheet modal. Escape and a press on the scrim call `onClose`, which
 * the caller answers by closing it, and focus goes back to the control that
 * asked. Tab wraps inside it, where a modal <dialog> alone lets it out to the
 * browser. Returns the cleanup.
 */
/**
 * Lets a closing surface leave on its own exit animation. A framework takes
 * the element away at once, so the returned cleanup, run as it goes, puts an
 * inert copy back where it stood, marks it `data-leaving` for the stylesheet
 * and drops it when its exit animations end, or at once without any. A portal
 * may take its own box away with the element, so the copy goes into the
 * nearest place above it that is still on the page. The copy waits a
 * microtask, since a development build detaches and reattaches a live element.
 */
export function leaveBehind(el: HTMLElement | null): () => void {
  if (!el) return () => {};
  const where = (): { chain: Node[]; next: Node | null } => {
    const chain: Node[] = [];
    for (let n = el.parentNode; n; n = n.parentNode) chain.push(n);
    return { chain, next: el.nextSibling };
  };
  // A framework may hand the element over before it is placed, so the place is read again once it is.
  let first = where();
  queueMicrotask(() => {
    if (el.isConnected) first = where();
  });
  return () => {
    const { chain, next } = el.isConnected ? where() : first;
    if (chain.length === 0) return;
    const copy = el.cloneNode(true) as HTMLElement;
    queueMicrotask(() => {
      if (el.isConnected) return;
      const host = chain.find((n) => n.isConnected);
      if (!host) return;
      for (const node of [copy, ...copy.querySelectorAll("[id]")]) node.removeAttribute("id");
      copy.setAttribute("data-leaving", "");
      copy.setAttribute("aria-hidden", "true");
      copy.inert = true;
      host.insertBefore(copy, next && next.parentNode === host ? next : null);
      const running = copy.getAnimations({ subtree: true }).filter((a) => a instanceof CSSAnimation && a.animationName.startsWith("glim-leave"));
      const drop = () => copy.remove();
      if (running.length === 0) return drop();
      void Promise.all(running.map((a) => a.finished)).then(drop, drop);
      setTimeout(drop, 1000);
    });
  };
}

/** leaveBehind for a framework that reports an element's removal as a null ref, as Vue's function refs do. */
export function leavingRef(): (el: unknown) => void {
  let leave: (() => void) | undefined;
  return (el) => {
    if (el instanceof HTMLElement) leave = leaveBehind(el);
    else {
      leave?.();
      leave = undefined;
    }
  };
}

export function openSheet(dialog: HTMLDialogElement, onClose: () => void): () => void {
  const asker = focusedAsker();
  dialog.showModal();
  const onCancel = (e: Event) => {
    e.preventDefault();
    onClose();
  };
  const onClick = (e: MouseEvent) => {
    if (e.target === dialog) onClose();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Tab") keepTabInside(dialog, e);
  };
  dialog.addEventListener("cancel", onCancel);
  dialog.addEventListener("click", onClick);
  dialog.addEventListener("keydown", onKey);
  return () => {
    dialog.removeEventListener("cancel", onCancel);
    dialog.removeEventListener("click", onClick);
    dialog.removeEventListener("keydown", onKey);
    if (dialog.open) dialog.close();
    returnFocus(asker);
  };
}
