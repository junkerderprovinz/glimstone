import { useId, useRef, type KeyboardEvent } from "react";
import * as angleSlider from "@zag-js/angle-slider";
import { normalizeProps, useMachine } from "@zag-js/react";
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

export function AngleSlider({ label, value, onChange, step = 15, marks = ANGLE_MARKS, disabled = false }: AngleSliderProps) {
  const name = useFieldName(label);
  const service = useMachine(angleSlider.machine, {
    id: useId(),
    dir: pageDir(),
    value,
    step,
    disabled,
    onValueChange: (d) => onChange(d.value),
  });
  const api = angleSlider.connect(service, normalizeProps);
  // Zag sends End to 359 whatever the step, so Home and End are answered here.
  const thumb = api.getThumbProps();
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const to = angleKeyTarget(e.key, step);
    if (to === undefined) return thumb.onKeyDown?.(e);
    e.preventDefault();
    api.setValue(to);
  };
  // A turn past 0° would spring the long way round, so that step lands at once.
  const last = useRef(api.value);
  const across = Math.abs(api.value - last.current) > 180;
  last.current = api.value;
  return (
    <div data-glim="AngleSlider" {...api.getRootProps()} className="glim-angle">
      <label {...api.getLabelProps()} className={label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name}
      </label>
      <div className="glim-angle-body">
        <div {...api.getControlProps()} className="glim-angle-dial">
          <div {...api.getMarkerGroupProps()} className="glim-angle-marks">
            {marks.map((mark) => (
              <span key={mark} {...api.getMarkerProps({ value: mark })} data-quarter={mark % 90 === 0 ? "" : undefined} className="glim-angle-mark" />
            ))}
          </div>
          <div {...thumb} onKeyDown={onKeyDown} aria-valuetext={`${api.value}°`} data-across={across ? "" : undefined} className="glim-angle-thumb">
            <span className="glim-angle-hand" />
          </div>
          <div {...api.getValueTextProps()} className="glim-angle-value glim-num">{`${api.value}°`}</div>
        </div>
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  );
}
