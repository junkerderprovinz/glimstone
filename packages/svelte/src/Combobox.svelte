<script lang="ts" module>
  import type { SelectOption } from "./selectParts.svelte.js";

  export interface ComboboxProps {
    label?: string;
    hideLabel?: boolean;
    options: SelectOption[];
    /** The chosen value, bound with `bind:value`, or "" while nothing is chosen. */
    value: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    /** The line the list shows when nothing matches. */
    empty: string;
    /** Accessible name of the button that opens the full list. */
    toggleLabel: string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import * as combobox from "@zag-js/combobox";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { useFieldName } from "./fieldName.js";
  import { IconCheck, IconExpand } from "./glyphs.js";
  import { lift } from "./lift.js";

  // A field that filters a list while somebody types, for lists too long for a
  // Select: containers, time zones, languages. Focus stays in the field while
  // the arrows move through the list, and a search that finds nothing says so
  // instead of closing, since a list that vanishes reads as a broken field.
  let { label, hideLabel, options, value = $bindable(), onChange, placeholder, empty, toggleLabel, disabled }: ComboboxProps = $props();

  const name = useFieldName(() => label);
  const id = $props.id();
  // svelte-ignore state_referenced_locally
  let shown = $state.raw(options);
  const service = useMachine(combobox.machine, () => ({
    id,
    collection: combobox.collection({
      items: shown,
      itemToValue: (o: SelectOption) => o.value,
      itemToString: (o: SelectOption) => o.label,
      isItemDisabled: (o: SelectOption) => !!o.disabled,
    }),
    value: value ? [value] : [],
    placeholder,
    disabled,
    positioning: { sameWidth: true, gutter: 6 },
    // Typing opens the list after the filter has run, so only a close may put
    // the full list back.
    onOpenChange: ({ open }: { open: boolean }) => {
      if (!open) shown = options;
    },
    onInputValueChange: ({ inputValue }: { inputValue: string }) => {
      const q = inputValue.toLocaleLowerCase();
      shown = options.filter((o) => o.label.toLocaleLowerCase().includes(q));
    },
    onValueChange: (d: { value: string[] }) => {
      value = d.value[0] ?? "";
      onChange?.(value);
    },
  }));
  const api = $derived(combobox.connect(service, normalizeProps));
</script>

<div data-glim="Combobox" {...api.getRootProps()} class="glim-combobox">
  <label {...api.getLabelProps()} class={hideLabel || label === undefined ? "glim-sr-only" : "glim-field-label"}>{name()}</label>
  <div {...api.getControlProps()} class="glim-combobox-control">
    <input {...api.getInputProps()} class="glim-combobox-input" />
    <button {...api.getTriggerProps()} aria-label={toggleLabel} class="glim-combobox-toggle">
      <span class="glim-select-indicator" data-state={api.open ? "open" : "closed"}>{@render IconExpand()}</span>
    </button>
  </div>
  <div {@attach lift} {...api.getPositionerProps()} class="glim-select-positioner">
    <ul {...api.getContentProps()} class="glim-select-content">
      {#if shown.length === 0}
        <li class="glim-select-empty">{empty}</li>
      {/if}
      {#each shown as item (item.value)}
        <li {...api.getItemProps({ item })} class="glim-select-item">
          <span {...api.getItemTextProps({ item })}>{item.label}</span>
          <span {...api.getItemIndicatorProps({ item })} class="glim-select-check">{@render IconCheck()}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
