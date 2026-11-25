import {
  MULTI_SELECT_SEARCH_AFTER,
  MULTI_SELECT_TEXT,
  multiSelectMatches,
  multiSelectSearches,
  multiSelectWithout,
  pageDir,
  portalTarget,
  type MultiSelectText,
} from "@glimstone/core";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import * as combobox from "@zag-js/combobox";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useFieldName } from "./fieldName.ts";
import { IconCheck, IconClose, IconExpand } from "./glyphs.tsx";
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

export function MultiSelect({
  label,
  hideLabel,
  options,
  value,
  onChange,
  placeholder,
  searchAfter,
  disabled = false,
  text,
}: MultiSelectProps) {
  const name = useFieldName(label);
  const words = { ...MULTI_SELECT_TEXT, ...text };
  const searches = multiSelectSearches(options.length, searchAfter ?? MULTI_SELECT_SEARCH_AFTER);
  const [query, setQuery] = useState("");
  const shown = searches ? multiSelectMatches(options, query) : options;
  const field = useRef<HTMLInputElement>(null);
  const collection = combobox.collection({
    items: shown,
    itemToValue: (o) => o.value,
    itemToString: (o) => o.label,
    isItemDisabled: (o) => !!o.disabled,
  });
  const service = useMachine(combobox.machine, {
    id: useId(),
    dir: pageDir(),
    collection,
    value,
    multiple: true,
    disabled,
    openOnClick: true,
    selectionBehavior: "clear",
    positioning: { sameWidth: true, gutter: 6 },
    onOpenChange: ({ open }) => !open && setQuery(""),
    onInputValueChange: ({ inputValue }) => setQuery(inputValue),
    onValueChange: (d) => onChange(d.value),
  });
  const api = combobox.connect(service, normalizeProps);
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const ip = api.getInputProps();
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && api.inputValue === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
      return;
    }
    if (!searches && e.key === " ") {
      e.preventDefault();
      if (!api.open) api.setOpen(true);
      else if (api.highlightedValue) api.selectValue(api.highlightedValue);
      return;
    }
    ip.onKeyDown?.(e);
  };
  const remove = (v: string) => {
    onChange(multiSelectWithout(value, v));
    field.current?.focus();
  };

  return (
    <div data-glim="MultiSelect" {...api.getRootProps()} className="glim-tags">
      <label {...api.getLabelProps()} className={hideLabel || label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name}
      </label>
      <div {...api.getControlProps()} className={searches ? "glim-tags-control" : "glim-tags-control glim-tags-control--pick"}>
        {value.map((v) => (
          <span key={v} className="glim-tag-item">
            <span className="glim-tag">
              <span className="glim-tag-text">{labelOf(v)}</span>
              <button type="button" disabled={disabled} aria-label={words.remove(labelOf(v))} onClick={() => remove(v)} className="glim-tag-remove">
                <IconClose />
              </button>
            </span>
          </span>
        ))}
        <input
          {...ip}
          ref={field}
          readOnly={!searches}
          placeholder={value.length === 0 ? placeholder : searches ? words.search : undefined}
          onKeyDown={onKeyDown}
          className="glim-tags-input"
        />
        <button {...api.getTriggerProps()} aria-label={words.toggle} className="glim-combobox-toggle">
          <span className="glim-select-indicator" data-state={api.open ? "open" : "closed"}>
            <IconExpand />
          </span>
        </button>
      </div>
      <Portal container={{ current: portalTarget() }}>
        <div {...api.getPositionerProps()} className="glim-select-positioner">
          <ul {...api.getContentProps()} className="glim-select-content">
            {shown.length === 0 && <li className="glim-select-empty">{words.empty}</li>}
            {shown.map((item) => (
              <li key={item.value} {...api.getItemProps({ item })} className="glim-select-item">
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })} className="glim-select-check">
                  <IconCheck />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  );
}
