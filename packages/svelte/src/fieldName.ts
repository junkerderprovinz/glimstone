// How a FieldRow names the control inside it.

import { getContext } from "svelte";

export const FIELD_ROW = Symbol("glimstone.fieldRow");
export const FIELD_ROW_GROUP = Symbol("glimstone.fieldRowGroup");

/** A control's accessible name: its own, or the label of the row it stands in. */
export function useFieldName(own: () => string | undefined): () => string | undefined {
  const row = getContext<(() => string) | undefined>(FIELD_ROW);
  return () => own() ?? row?.();
}
