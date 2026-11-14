// How a FieldRow names the control inside it.

import { createContext, useContext, type Accessor } from "solid-js";

export const FieldRowContext = createContext<Accessor<string | undefined>>(() => undefined);
export const FieldRowGroupContext = createContext(false);

/** A control's accessible name: its own, or the label of the row it stands in. */
export function useFieldName(own: () => string | undefined): Accessor<string | undefined> {
  const row = useContext(FieldRowContext);
  return () => own() ?? row();
}
