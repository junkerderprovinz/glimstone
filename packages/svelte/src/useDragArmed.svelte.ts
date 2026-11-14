/**
 * useDragArmed makes the other items of a reorderable list tremble while one
 * is held, by keeping `glim-drag-armed` on the list. Call it from the drag
 * gesture, so no list can forget the class.
 */
export function useDragArmed(list: () => HTMLElement | null | undefined, held: () => boolean): void {
  $effect(() => {
    const el = list();
    if (!el) return;
    const on = held();
    const apply = () => {
      if (el.classList.contains("glim-drag-armed") !== on) el.classList.toggle("glim-drag-armed", on);
    };
    apply();
    if (!on) return;
    // A list that binds its own class sets the whole attribute and drops this one.
    const observer = new MutationObserver(apply);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  });
}
