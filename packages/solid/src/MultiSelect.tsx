import {
  MULTI_SELECT_SEARCH_AFTER,
  MULTI_SELECT_TEXT,
  multiSelectMatches,
  multiSelectSearches,
  multiSelectWithout,
  pageDir,
  type MultiSelectText,
} from "@glimstone/core";
import { createMemo, createSignal, createUniqueId, For, mergeProps, Show } from "solid-js";
import * as combobox from "@zag-js/combobox";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { useFieldName } from "./fieldName.ts";
import { IconCheck, IconClose, IconExpand } from "./glyphs.tsx";
import { Lift } from "./Lift.tsx";
import { SearchHit } from "./searchHit.tsx";
import type { SelectOption } from "./Select.tsx";

export type { MultiSelectText } from "@glimstone/core";

// A field that picks several choices from a list and keeps them as tags, each
// with its own remove mark. It is Zag's combobox in multiple mode, so focus
// stays in the field while the arrows move through the list, and a pick keeps
// the list open for the next. A short list takes no typing and answers Space
// the way a Select does; a long one filters as somebody types.

export interface MultiSelectProps {
  label?: string;
  hideLabel?: boolean;
  options: SelectOption[];
  /** The picked values, in the order they were picked. */
  value: string[];
  onChange: (value: string[]) => void;
  /** Shown while nothing is picked. */
  placeholder?: string;
  /** How many choices the list shows before the field takes a search, seven unless given. */
  searchAfter?: number;
  disabled?: boolean;
  text?: Partial<MultiSelectText>;
}

export function MultiSelect(raw: MultiSelectProps) {
  const props = mergeProps({ disabled: false }, raw);
  const name = useFieldName(() => props.label);
  const words = createMemo(() => ({ ...MULTI_SELECT_TEXT, ...props.text }));
  const searches = createMemo(() => multiSelectSearches(props.options.length, props.searchAfter ?? MULTI_SELECT_SEARCH_AFTER));
  const [query, setQuery] = createSignal("");
  const shown = createMemo(() => (searches() ? multiSelectMatches(props.options, query()) : props.options));
  let field: HTMLInputElement | undefined;
  const id = createUniqueId();
  const service = useMachine(combobox.machine, () => ({
    id,
    dir: pageDir(),
    collection: combobox.collection({
      items: shown(),
      itemToValue: (o) => o.value,
      itemToString: (o) => o.label,
      isItemDisabled: (o) => !!o.disabled,
    }),
    value: props.value,
    multiple: true,
    disabled: props.disabled,
    openOnClick: true,
    selectionBehavior: "clear" as const,
    positioning: { sameWidth: true, gutter: 6 },
    onOpenChange: ({ open }: { open: boolean }) => !open && setQuery(""),
    onInputValueChange: ({ inputValue }: { inputValue: string }) => setQuery(inputValue),
    onValueChange: (d: { value: string[] }) => props.onChange(d.value),
  }));
  const api = createMemo(() => combobox.connect(service, normalizeProps));
  const labelOf = (v: string) => props.options.find((o) => o.value === v)?.label ?? v;
  const input = createMemo(() => {
    const { onKeyDown, ...rest } = api().getInputProps() as Record<string, unknown> & { onKeyDown?: (e: KeyboardEvent) => void };
    return { rest, onKeyDown };
  });
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Backspace" && api().inputValue === "" && props.value.length > 0) {
      e.preventDefault();
      props.onChange(props.value.slice(0, -1));
      return;
    }
    if (!searches() && e.key === " ") {
      e.preventDefault();
      if (!api().open) api().setOpen(true);
      else if (api().highlightedValue) api().selectValue(api().highlightedValue!);
      return;
    }
    input().onKeyDown?.(e);
  };
  const remove = (v: string) => {
    props.onChange(multiSelectWithout(props.value, v));
    field?.focus();
  };

  return (
    <div data-glim="MultiSelect" {...api().getRootProps()} class="glim-tags">
      <label {...api().getLabelProps()} class={props.hideLabel || props.label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name()}
      </label>
      <div {...api().getControlProps()} class={searches() ? "glim-tags-control" : "glim-tags-control glim-tags-control--pick"}>
        <For each={props.value}>
          {(v) => (
            <span class="glim-tag-item">
              <span class="glim-tag">
                <span class="glim-tag-text">{labelOf(v)}</span>
                <button type="button" disabled={props.disabled} aria-label={words().remove(labelOf(v))} onClick={() => remove(v)} class="glim-tag-remove">
                  <IconClose />
                </button>
              </span>
            </span>
          )}
        </For>
        <input
          {...input().rest}
          ref={field}
          readOnly={!searches()}
          placeholder={props.value.length === 0 ? props.placeholder : searches() ? words().search : undefined}
          onKeyDown={onKeyDown}
          class="glim-tags-input"
        />
        <button {...api().getTriggerProps()} aria-label={words().toggle} class="glim-combobox-toggle">
          <span class="glim-select-indicator" data-state={api().open ? "open" : "closed"}>
            <IconExpand />
          </span>
        </button>
      </div>
      <Lift>
        <div {...api().getPositionerProps()} class="glim-select-positioner">
          <ul {...api().getContentProps()} class="glim-select-content">
            <Show when={shown().length === 0}>
              <li class="glim-select-empty">{words().empty}</li>
            </Show>
            <For each={shown()}>
              {(item) => (
                <li {...api().getItemProps({ item })} class="glim-select-item">
                  <span {...api().getItemTextProps({ item })} data-search={searches() && query() ? "" : undefined}>
                    <SearchHit label={item.label} query={searches() ? query() : ""} />
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
