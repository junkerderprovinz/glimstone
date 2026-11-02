import { useId, useState } from "react";
import * as combobox from "@zag-js/combobox";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { IconCheck, IconExpand } from "./glyphs";
import type { SelectOption } from "./Select";

// A field that filters a list while somebody types, for lists too long for a
// Select: containers, time zones, languages. Focus stays in the field while
// the arrows move through the list, and a search that finds nothing says so
// instead of closing, since a list that vanishes reads as a broken field.

export interface ComboboxProps {
  label: string;
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

export function Combobox({ label, hideLabel, options, value, onChange, placeholder, empty, toggleLabel, disabled }: ComboboxProps) {
  const [shown, setShown] = useState(options);
  const collection = combobox.collection({
    items: shown,
    itemToValue: (o) => o.value,
    itemToString: (o) => o.label,
    isItemDisabled: (o) => !!o.disabled,
  });
  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    value: value ? [value] : [],
    placeholder,
    disabled,
    positioning: { sameWidth: true, gutter: 6 },
    // Typing opens the list after the filter has run, so only a close may put
    // the full list back.
    onOpenChange: ({ open }) => !open && setShown(options),
    onInputValueChange: ({ inputValue }) => {
      const q = inputValue.toLocaleLowerCase();
      setShown(options.filter((o) => o.label.toLocaleLowerCase().includes(q)));
    },
    onValueChange: (d) => onChange(d.value[0] ?? ""),
  });
  const api = combobox.connect(service, normalizeProps);

  return (
    <div {...api.getRootProps()} className="grid min-w-0 gap-1.5">
      <label {...api.getLabelProps()} className={hideLabel ? "sr-only" : "glim-field-label"}>
        {label}
      </label>
      <div {...api.getControlProps()} className="glim-combobox-control">
        <input {...api.getInputProps()} className="glim-combobox-input" />
        <button {...api.getTriggerProps()} aria-label={toggleLabel} className="glim-combobox-toggle">
          <span className="glim-select-indicator" data-state={api.open ? "open" : "closed"}>
            <IconExpand />
          </span>
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()} className="z-50">
          <ul {...api.getContentProps()} className="glim-select-content">
            {shown.length === 0 && <li className="glim-select-empty">{empty}</li>}
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
