<script lang="ts" module>
  import type { PinInputText } from "@glimstone/core";

  export type { PinInputText } from "@glimstone/core";

  export interface PinInputProps {
    label?: string;
    /** The code as one string, bound with `bind:value`. An empty box is a missing character at its end. */
    value: string;
    onChange?: (value: string) => void;
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
</script>

<script lang="ts">
  import * as pinInput from "@zag-js/pin-input";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { PIN_INPUT_TEXT, pinCells } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";

  // A short code typed one character to a box, such as the six digits of a
  // second factor. A code is data, so the boxes run left to right in every
  // language. Inside a FieldRow the row names it.
  let {
    label,
    value = $bindable(),
    onChange,
    onComplete,
    length = 6,
    type = "numeric",
    mask = false,
    otp = false,
    invalid = false,
    disabled = false,
    text,
  }: PinInputProps = $props();

  const name = useFieldName(() => label);
  const words = $derived({ ...PIN_INPUT_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(pinInput.machine, () => ({
    id,
    dir: "ltr" as const,
    count: length,
    value: pinCells(value, length),
    type,
    mask,
    otp,
    invalid,
    disabled,
    placeholder: "",
    onValueChange: (d: { valueAsString: string }) => {
      value = d.valueAsString;
      onChange?.(d.valueAsString);
    },
    onValueComplete: (d: { valueAsString: string }) => onComplete?.(d.valueAsString),
    translations: { inputLabel: (index: number, count: number) => words.cell(index + 1, count) },
  }));
  const api = $derived(pinInput.connect(service, normalizeProps));
</script>

<div data-glim="PinInput" {...api.getRootProps()} class="glim-pin">
  <label {...api.getLabelProps()} class={label === undefined ? "glim-sr-only" : "glim-field-label"}>{name()}</label>
  <div {...api.getControlProps()} class="glim-pin-control">
    {#each api.items as index (index)}
      <input {...api.getInputProps({ index })} class="glim-input glim-pin-cell glim-num" />
    {/each}
  </div>
  <input {...api.getHiddenInputProps()} />
</div>
