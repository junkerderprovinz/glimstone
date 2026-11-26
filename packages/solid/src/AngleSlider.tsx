import { createMemo, createUniqueId, For, mergeProps } from "solid-js";
import * as angleSlider from "@zag-js/angle-slider";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { ANGLE_MARKS, angleKeyTarget, pageDir } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";

// An angle set on a dial, such as how far a picture turns. The dial is round
// whatever the shape setting, since a circle is its geometry and not a corner.
// A hand points from the middle to the knob, and the value stands in the
// middle in degrees, left to right in every language. It snaps every 15
// degrees unless `step` asks for finer, with a tick at each snap. Inside a
// FieldRow the row names it.

export interface AngleSliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  /** The angles that carry a tick on the dial. A tick on a quarter is longer. */
  marks?: number[];
  disabled?: boolean;
}


export function AngleSlider(raw: AngleSliderProps) {
  const props = mergeProps({ step: 15, marks: ANGLE_MARKS, disabled: false }, raw);
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
  // Zag sends End to 359 whatever the step, so Home and End are answered here.
  const thumb = () => {
    const own = api().getThumbProps();
    return {
      ...own,
      onKeyDown: (e: KeyboardEvent) => {
        const to = angleKeyTarget(e.key, props.step);
        if (to === undefined) return (own.onKeyDown as (e: KeyboardEvent) => void)(e);
        e.preventDefault();
        api().setValue(to);
      },
    };
  };
  // A turn past 0° would spring the long way round, so that step lands at once.
  const turn = createMemo<{ value: number; across: boolean }>((last) => ({ value: api().value, across: Math.abs(api().value - last.value) > 180 }), { value: props.value, across: false });
  return (
    <div data-glim="AngleSlider" {...api().getRootProps()} class="glim-angle">
      <label {...api().getLabelProps()} class={props.label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name()}
      </label>
      <div class="glim-angle-body">
        <div {...api().getControlProps()} class="glim-angle-dial">
          <div {...api().getMarkerGroupProps()} class="glim-angle-marks">
            <For each={props.marks}>
              {(mark) => <span {...api().getMarkerProps({ value: mark })} data-quarter={mark % 90 === 0 ? "" : undefined} class="glim-angle-mark" />}
            </For>
          </div>
          <div {...thumb()} aria-valuetext={`${api().value}°`} data-across={turn().across ? "" : undefined} class="glim-angle-thumb">
            <span class="glim-angle-hand" />
          </div>
          <div {...api().getValueTextProps()} class="glim-angle-value glim-num">{`${api().value}°`}</div>
        </div>
      </div>
      <input {...api().getHiddenInputProps()} />
    </div>
  );
}
