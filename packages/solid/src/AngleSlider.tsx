import { createMemo, createUniqueId, For, mergeProps } from "solid-js";
import * as angleSlider from "@zag-js/angle-slider";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { pageDir } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";

// An angle set on a dial, such as how far a picture turns. The dial is round
// whatever the shape setting, since a circle is its geometry and not a corner,
// and the value stands beside it in degrees, left to right in every language.
// Inside a FieldRow the row names it.

export interface AngleSliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  /** The angles that carry a tick on the dial. */
  marks?: number[];
  disabled?: boolean;
}

export function AngleSlider(raw: AngleSliderProps) {
  const props = mergeProps({ step: 1, marks: [0, 90, 180, 270], disabled: false }, raw);
  const id = createUniqueId();
  const name = useFieldName(() => props.label);
  const service = useMachine(angleSlider.machine, () => ({
    id,
    dir: pageDir(),
    value: props.value,
    step: props.step,
    disabled: props.disabled,
    onValueChange: (d: { value: number }) => props.onChange(d.value),
  }));
  const api = createMemo(() => angleSlider.connect(service, normalizeProps));
  return (
    <div data-glim="AngleSlider" {...api().getRootProps()} class="glim-angle">
      <label {...api().getLabelProps()} class={props.label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name()}
      </label>
      <div class="glim-angle-body">
        <div {...api().getControlProps()} class="glim-angle-dial">
          <div {...api().getMarkerGroupProps()} class="glim-angle-marks">
            <For each={props.marks}>{(mark) => <span {...api().getMarkerProps({ value: mark })} class="glim-angle-mark" />}</For>
          </div>
          <div {...api().getThumbProps()} aria-valuetext={`${api().value}°`} class="glim-angle-thumb" />
        </div>
        <div {...api().getValueTextProps()} class="glim-angle-value glim-num">{`${api().value}°`}</div>
      </div>
      <input {...api().getHiddenInputProps()} />
    </div>
  );
}
