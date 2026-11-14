import { createMemo, createUniqueId, Index, mergeProps } from "solid-js";
import * as slider from "@zag-js/slider";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { useFieldName } from "./fieldName.ts";

// A value on a range, for numbers people adjust rather than type. The value
// stands beside the label in words ("30 days"), and the same words are what a
// screen reader hears, through `format`. Inside a FieldRow the row names it and
// draws the words.

export interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** How the value reads, on screen and to a screen reader. */
  format: (value: number) => string;
  disabled?: boolean;
}

export function Slider(raw: SliderProps) {
  const props = mergeProps({ step: 1 }, raw);
  const id = createUniqueId();
  const name = useFieldName(() => props.label);
  const service = useMachine(slider.machine, () => ({
    id,
    value: [props.value],
    min: props.min,
    max: props.max,
    step: props.step,
    disabled: props.disabled,
    onValueChange: (d: { value: number[] }) => props.onChange(d.value[0]!),
    getAriaValueText: (d: { value: number }) => props.format(d.value),
  }));
  const api = createMemo(() => slider.connect(service, normalizeProps));

  return (
    <div data-glim="Slider" {...api().getRootProps()} class="glim-slider">
      <div class="glim-slider-head">
        <label {...api().getLabelProps()} class={props.label === undefined ? "glim-sr-only" : "glim-field-label"}>
          {name()}
        </label>
        <output {...api().getValueTextProps()} class="glim-slider-value">
          {props.format(api().value[0]!)}
        </output>
      </div>
      <div {...api().getControlProps()} class="glim-slider-control">
        <div {...api().getTrackProps()} class="glim-slider-track">
          <div {...api().getRangeProps()} class="glim-slider-range" />
        </div>
        <Index each={api().value}>
          {(_, index) => (
            <div {...api().getThumbProps({ index })} class="glim-slider-thumb">
              <input {...api().getHiddenInputProps({ index })} />
            </div>
          )}
        </Index>
      </div>
    </div>
  );
}
