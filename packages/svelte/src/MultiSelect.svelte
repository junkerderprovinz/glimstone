<script lang="ts" module>
  import type { MultiSelectText } from "@glimstone/core";
  import type { SelectOption } from "./selectParts.svelte.js";

  export type { MultiSelectText } from "@glimstone/core";

  export interface MultiSelectProps {
    label?: string;
    hideLabel?: boolean;
    options: SelectOption[];
    /** The picked values, bound with `bind:value`, in the order they were picked. */
    value: string[];
    onChange?: (value: string[]) => void;
    /** Shown while nothing is picked. */
    placeholder?: string;
    /** How many choices the list shows before the field takes a search, seven unless given. */
    searchAfter?: number;
    disabled?: boolean;
    text?: Partial<MultiSelectText>;
  }
</script>

<script lang="ts">
  import * as combobox from "@zag-js/combobox";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import {
    MULTI_SELECT_SEARCH_AFTER,
    MULTI_SELECT_TEXT,
    multiSelectMatches,
    multiSelectSearches,
    multiSelectWithout,
    pageDir,
  } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";
  import { IconCheck, IconClose, IconExpand } from "./glyphs.js";
  import { lift } from "./lift.js";

  // A field that picks several choices from a list and keeps them as tags,
  // each with its own remove mark. It is Zag's combobox in multiple mode, so
  // focus stays in the field while the arrows move through the list, and a
  // pick keeps the list open for the next. A short list takes no typing and
  // answers Space the way a Select does; a long one filters as somebody types.
  let {
    label,
    hideLabel,
    options,
    value = $bindable(),
    onChange,
    placeholder,
    searchAfter,
    disabled = false,
    text,
  }: MultiSelectProps = $props();

  const name = useFieldName(() => label);
  const words = $derived({ ...MULTI_SELECT_TEXT, ...text });
  const searches = $derived(multiSelectSearches(options.length, searchAfter ?? MULTI_SELECT_SEARCH_AFTER));
  let query = $state("");
  const shown = $derived(searches ? multiSelectMatches(options, query) : options);
  let field: HTMLInputElement | undefined = $state();
  const id = $props.id();

  function pick(next: string[]) {
    value = next;
    onChange?.(next);
  }

  const service = useMachine(combobox.machine, () => ({
    id,
    dir: pageDir(),
    collection: combobox.collection({
      items: shown,
      itemToValue: (o: SelectOption) => o.value,
      itemToString: (o: SelectOption) => o.label,
      isItemDisabled: (o: SelectOption) => !!o.disabled,
    }),
    value,
    multiple: true,
    disabled,
    openOnClick: true,
    selectionBehavior: "clear" as const,
    positioning: { sameWidth: true, gutter: 6 },
    onOpenChange: ({ open }: { open: boolean }) => {
      if (!open) query = "";
    },
    onInputValueChange: ({ inputValue }: { inputValue: string }) => (query = inputValue),
    onValueChange: (d: { value: string[] }) => pick(d.value),
  }));
  const api = $derived(combobox.connect(service, normalizeProps));
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const input = $derived.by(() => {
    const { onkeydown, ...rest } = api.getInputProps() as Record<string, unknown> & { onkeydown?: (e: KeyboardEvent) => void };
    return { rest, onkeydown };
  });

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Backspace" && api.inputValue === "" && value.length > 0) {
      e.preventDefault();
      pick(value.slice(0, -1));
      return;
    }
    if (!searches && e.key === " ") {
      e.preventDefault();
      if (!api.open) api.setOpen(true);
      else if (api.highlightedValue) api.selectValue(api.highlightedValue);
      return;
    }
    input.onkeydown?.(e);
  }

  function remove(v: string) {
    pick(multiSelectWithout(value, v));
    field?.focus();
  }
</script>

<div data-glim="MultiSelect" {...api.getRootProps()} class="glim-tags">
  <label {...api.getLabelProps()} class={hideLabel || label === undefined ? "glim-sr-only" : "glim-field-label"}>{name()}</label>
  <div {...api.getControlProps()} class={searches ? "glim-tags-control" : "glim-tags-control glim-tags-control--pick"}>
    {#each value as v (v)}
      <span class="glim-tag-item">
        <span class="glim-tag">
          <span class="glim-tag-text">{labelOf(v)}</span>
          <button type="button" {disabled} aria-label={words.remove(labelOf(v))} onclick={() => remove(v)} class="glim-tag-remove">
            {@render IconClose()}
          </button>
        </span>
      </span>
    {/each}
    <input
      {...input.rest}
      bind:this={field}
      readonly={!searches}
      placeholder={value.length === 0 ? placeholder : searches ? words.search : undefined}
      {onkeydown}
      class="glim-tags-input"
    />
    <button {...api.getTriggerProps()} aria-label={words.toggle} class="glim-combobox-toggle">
      <span class="glim-select-indicator" data-state={api.open ? "open" : "closed"}>{@render IconExpand()}</span>
    </button>
  </div>
  <div {@attach lift} {...api.getPositionerProps()} class="glim-select-positioner">
    <ul {...api.getContentProps()} class="glim-select-content">
      {#if shown.length === 0}
        <li class="glim-select-empty">{words.empty}</li>
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
