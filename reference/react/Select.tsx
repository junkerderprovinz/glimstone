import { useId } from "react";
import * as select from "@zag-js/select";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { IconCheck, IconExpand } from "./glyphs";

// The one way to pick a value from a short list. Zag's select machine carries
// the behaviour the contract asks for (typeahead, Home and End, focus kept on
// the trigger, aria-activedescendant, dismissal), and the select rules in
// tokens.css, `.glim-select-trigger` and its siblings, carry the look, so a page
// without React mounts the same machine through ../select.ts and looks the same.
//
// The list renders into a portal, so no card or scroll box can clip it.

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** The field's name, always the accessible name. */
  label: string;
  /** Draw the label off screen, for a settings row that names the field at its start. */
  hideLabel?: boolean;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Shown while nothing is chosen. */
  placeholder?: string;
  disabled?: boolean;
}

export function Select({ label, hideLabel, options, value, onChange, placeholder, disabled }: SelectProps) {
  const collection = select.collection({
    items: options,
    itemToValue: (o) => o.value,
    itemToString: (o) => o.label,
    isItemDisabled: (o) => !!o.disabled,
  });
  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    value: [value],
    disabled,
    onValueChange: (d) => d.value[0] !== undefined && onChange(d.value[0]),
    positioning: { sameWidth: true, gutter: 6 },
  });
  const api = select.connect(service, normalizeProps);

  return (
    <div {...api.getRootProps()} className="grid min-w-0 gap-1.5">
      <label {...api.getLabelProps()} className={hideLabel ? "sr-only" : "glim-field-label"}>
        {label}
      </label>
      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()} className="glim-select-trigger">
          <span className="truncate">{api.valueAsString || placeholder}</span>
          <span {...api.getIndicatorProps()} className="glim-select-indicator">
            <IconExpand />
          </span>
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()} className="z-50">
          <ul {...api.getContentProps()} className="glim-select-content">
            {options.map((item) => (
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
      <select {...api.getHiddenSelectProps()} />
    </div>
  );
}
