import { createMemo, createUniqueId, For, mergeProps } from "solid-js";
import * as pinInput from "@zag-js/pin-input";
import { normalizeProps, useMachine } from "@zag-js/solid";
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

export function PinInput(raw: PinInputProps) {
  const props = mergeProps({ length: 6, type: "numeric", mask: false, otp: false, invalid: false, disabled: false } as const, raw);
  const name = useFieldName(() => props.label);
  const words = () => ({ ...PIN_INPUT_TEXT, ...props.text });
  const id = createUniqueId();
  const service = useMachine(pinInput.machine, () => ({
    id,
    dir: "ltr" as const,
    count: props.length,
    value: pinCells(props.value, props.length),
    type: props.type,
    mask: props.mask,
    otp: props.otp,
    invalid: props.invalid,
    disabled: props.disabled,
    placeholder: "",
    onValueChange: (d: { valueAsString: string }) => props.onChange(d.valueAsString),
    onValueComplete: (d: { valueAsString: string }) => props.onComplete?.(d.valueAsString),
    translations: { inputLabel: (index: number, count: number) => words().cell(index + 1, count) },
  }));
  const api = createMemo(() => pinInput.connect(service, normalizeProps));
  return (
    <div data-glim="PinInput" {...api().getRootProps()} class="glim-pin">
      <label {...api().getLabelProps()} class={props.label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name()}
      </label>
      <div {...api().getControlProps()} class="glim-pin-control">
        <For each={api().items}>{(index) => <input {...api().getInputProps({ index })} class="glim-input glim-pin-cell glim-num" />}</For>
      </div>
      <input {...api().getHiddenInputProps()} />
    </div>
  );
}
