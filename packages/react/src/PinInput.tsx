import { useId } from "react";
import * as pinInput from "@zag-js/pin-input";
import { normalizeProps, useMachine } from "@zag-js/react";
import { PIN_INPUT_TEXT, pinCells, type PinInputText } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";

export type { PinInputText } from "@glimstone/core";

// A short code typed one character to a box, such as the six digits of a
// second factor. A code is data, so the boxes run left to right in every
// language. Inside a FieldRow the row names it.

export interface PinInputProps {
  label?: string;
  /** The code as one string; an empty box is a missing character at its end. */
  value: string;
  onChange: (value: string) => void;
  /** Called once every box holds a character. */
  onComplete?: (value: string) => void;
  length?: number;
  /** What a box takes: digits by default. */
  type?: "numeric" | "alphanumeric" | "alphabetic";
  /** Draws dots instead of the characters, for a code that is a secret. */
  mask?: boolean;
  /** Offers the code the phone just received, as a one-time code. */
  otp?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  text?: Partial<PinInputText>;
}

export function PinInput({ label, value, onChange, onComplete, length = 6, type = "numeric", mask = false, otp = false, invalid = false, disabled = false, text }: PinInputProps) {
  const name = useFieldName(label);
  const words = { ...PIN_INPUT_TEXT, ...text };
  const service = useMachine(pinInput.machine, {
    id: useId(),
    dir: "ltr",
    count: length,
    value: pinCells(value, length),
    type,
    mask,
    otp,
    invalid,
    disabled,
    placeholder: "",
    onValueChange: (d) => onChange(d.valueAsString),
    onValueComplete: (d) => onComplete?.(d.valueAsString),
    translations: { inputLabel: (index, count) => words.cell(index + 1, count) },
  });
  const api = pinInput.connect(service, normalizeProps);
  return (
    <div data-glim="PinInput" {...api.getRootProps()} className="glim-pin">
      <label {...api.getLabelProps()} className={label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name}
      </label>
      <div {...api.getControlProps()} className="glim-pin-control">
        {api.items.map((index) => (
          <input key={index} {...api.getInputProps({ index })} className="glim-input glim-pin-cell glim-num" />
        ))}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  );
}
