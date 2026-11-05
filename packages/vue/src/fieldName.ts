// How a FieldRow names the control inside it.

import { computed, inject, type ComputedRef, type InjectionKey } from "vue";

export const FIELD_ROW: InjectionKey<ComputedRef<string>> = Symbol("glimstone.fieldRow");

/** A control's accessible name: its own, or the label of the row it stands in. */
export function useFieldName(own: () => string | undefined): ComputedRef<string | undefined> {
  const row = inject(FIELD_ROW, null);
  return computed(() => own() ?? row?.value);
}
