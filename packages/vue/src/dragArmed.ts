import { onUpdated, watchEffect, type Ref } from "vue";

/**
 * useDragArmed makes the other items of a reorderable list tremble while one
 * is held, by keeping `glim-drag-armed` on the list. Call it from the drag
 * gesture, so no list can forget the class.
 */
export function useDragArmed(list: Ref<HTMLElement | null>, held: () => boolean): void {
  const apply = () => list.value?.classList.toggle("glim-drag-armed", held());
  watchEffect(apply, { flush: "post" });
  // A `:class` binding on the list sets the whole class attribute when it patches.
  onUpdated(apply);
}
