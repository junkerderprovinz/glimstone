import { useId } from "react";
import * as slider from "@zag-js/slider";
import { normalizeProps, useMachine } from "@zag-js/react";

// A value on a range, for numbers people adjust rather than type. The value
// stands beside the label in words ("30 days"), and the same words are what a
// screen reader hears, through `format`.

export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** How the value reads, on screen and to a screen reader. */
  format: (value: number) => string;
  disabled?: boolean;
}

export function Slider({ label, value, onChange, min, max, step = 1, format, disabled }: SliderProps) {
  const service = useMachine(slider.machine, {
    id: useId(),
    value: [value],
    min,
    max,
    step,
    disabled,
    onValueChange: (d) => onChange(d.value[0]),
    getAriaValueText: (d) => format(d.value),
  });
  const api = slider.connect(service, normalizeProps);

  return (
    <div {...api.getRootProps()} className="grid min-w-0 gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <label {...api.getLabelProps()} className="glim-field-label">
          {label}
        </label>
        <output {...api.getValueTextProps()} className="glim-slider-value">
          {format(api.value[0])}
        </output>
      </div>
      <div {...api.getControlProps()} className="glim-slider-control">
        <div {...api.getTrackProps()} className="glim-slider-track">
          <div {...api.getRangeProps()} className="glim-slider-range" />
        </div>
        {api.value.map((_, index) => (
          <div key={index} {...api.getThumbProps({ index })} className="glim-slider-thumb">
            <input {...api.getHiddenInputProps({ index })} />
          </div>
        ))}
      </div>
    </div>
  );
}
