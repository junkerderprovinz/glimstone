import { useId } from "react";
import * as angleSlider from "@zag-js/angle-slider";
import { normalizeProps, useMachine } from "@zag-js/react";
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

export function AngleSlider({ label, value, onChange, step = 1, marks = [0, 90, 180, 270], disabled = false }: AngleSliderProps) {
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
  return (
    <div data-glim="AngleSlider" {...api.getRootProps()} className="glim-angle">
      <label {...api.getLabelProps()} className={label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name}
      </label>
      <div className="glim-angle-body">
        <div {...api.getControlProps()} className="glim-angle-dial">
          <div {...api.getMarkerGroupProps()} className="glim-angle-marks">
            {marks.map((mark) => (
              <span key={mark} {...api.getMarkerProps({ value: mark })} className="glim-angle-mark" />
            ))}
          </div>
          <div {...api.getThumbProps()} aria-valuetext={`${api.value}°`} className="glim-angle-thumb" />
        </div>
        <div {...api.getValueTextProps()} className="glim-angle-value glim-num">{`${api.value}°`}</div>
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  );
}
