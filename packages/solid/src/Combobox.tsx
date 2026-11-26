import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js";
import * as combobox from "@zag-js/combobox";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { useFieldName } from "./fieldName.ts";
import { IconCheck, IconExpand } from "./glyphs.tsx";
import { Lift } from "./Lift.tsx";
import { SearchHit } from "./searchHit.tsx";
import type { SelectOption } from "./Select.tsx";

// A field that filters a list while somebody types, for lists too long for a
// Select: containers, time zones, languages. Focus stays in the field while
// the arrows move through the list, and a search that finds nothing says so
// instead of closing, since a list that vanishes reads as a broken field.
// While somebody types, each row sets apart the part that matches.

export interface ComboboxProps {
  label?: string;
  hideLabel?: boolean;
  options: SelectOption[];
  /** The chosen value, or "" while nothing is chosen. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** The line the list shows when nothing matches. */
  empty: string;
  /** Accessible name of the button that opens the full list. */
  toggleLabel: string;
  disabled?: boolean;
}

export function Combobox(props: ComboboxProps) {
  const name = useFieldName(() => props.label);
  const id = createUniqueId();
  const [shown, setShown] = createSignal(props.options);
  const [query, setQuery] = createSignal("");
  const service = useMachine(combobox.machine, () => ({
    id,
    collection: combobox.collection({
      items: shown(),
      itemToValue: (o) => o.value,
      itemToString: (o) => o.label,
      isItemDisabled: (o) => !!o.disabled,
    }),
    value: props.value ? [props.value] : [],
    placeholder: props.placeholder,
    disabled: props.disabled,
    positioning: { sameWidth: true, gutter: 6 },
    // Typing opens the list after the filter has run, so only a close may put
    // the full list back.
    onOpenChange: ({ open }: { open: boolean }) => {
      if (open) return;
      setShown(props.options);
      setQuery("");
    },
    onInputValueChange: ({ inputValue, reason }: { inputValue: string; reason?: string }) => {
      // Picking an item writes its label into the field, which is no search.
      const typed = reason === "input-change" ? inputValue : "";
      const q = typed.toLocaleLowerCase();
      setQuery(typed);
      setShown(props.options.filter((o) => o.label.toLocaleLowerCase().includes(q)));
    },
    onValueChange: (d: { value: string[] }) => props.onChange(d.value[0] ?? ""),
  }));
  const api = createMemo(() => combobox.connect(service, normalizeProps));

  return (
    <div data-glim="Combobox" {...api().getRootProps()} class="glim-combobox">
      <label {...api().getLabelProps()} class={props.hideLabel || props.label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name()}
      </label>
      <div {...api().getControlProps()} class="glim-combobox-control">
        <input {...api().getInputProps()} class="glim-combobox-input" />
        <button {...api().getTriggerProps()} aria-label={props.toggleLabel} class="glim-combobox-toggle">
          <span class="glim-select-indicator" data-state={api().open ? "open" : "closed"}>
            <IconExpand />
          </span>
        </button>
      </div>
      <Lift>
        <div {...api().getPositionerProps()} class="glim-select-positioner">
          <ul {...api().getContentProps()} class="glim-select-content">
            <Show when={shown().length === 0}>
              <li class="glim-select-empty">{props.empty}</li>
            </Show>
            <For each={shown()}>
              {(item) => (
                <li {...api().getItemProps({ item })} class="glim-select-item">
                  <span {...api().getItemTextProps({ item })} data-search={query() ? "" : undefined}>
                    <SearchHit label={item.label} query={query()} />
                  </span>
                  <span {...api().getItemIndicatorProps({ item })} class="glim-select-check">
                    <IconCheck />
                  </span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Lift>
    </div>
  );
}
