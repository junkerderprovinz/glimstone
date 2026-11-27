// A row's label in a list that filters as somebody types, with the part that
// matches the search set apart.

import { Show } from "solid-js";
import { searchParts } from "@glimstone/core";

export function SearchHit(props: { label: string; query: string }) {
  const parts = () => searchParts(props.label, props.query);
  return (
    <Show when={parts()} fallback={props.label}>
      {(p) => (
        <>
          {p().before}
          <span class="glim-combobox-hit">{p().hit}</span>
          {p().after}
        </>
      )}
    </Show>
  );
}
