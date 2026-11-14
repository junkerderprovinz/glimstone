import { useId } from "react";
import * as ratingGroup from "@zag-js/rating-group";
import { normalizeProps, useMachine } from "@zag-js/react";
import { RATING_TEXT, pageDir, type RatingText } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";
import { IconStar } from "./glyphs.tsx";

export type { RatingText } from "@glimstone/core";

// A value given in stars, such as how well a release worked. The stars up to
// the value are filled with the accent, the rest stand on the third surface.
// It is a radio group: the arrows move the value, and a pointer over a star
// shows what a press would give. Inside a FieldRow the row names it.

export interface RatingProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  count?: number;
  /** Takes half stars, from the pointer and from the arrows. */
  allowHalf?: boolean;
  /** Shows the value and takes no input, such as an average. */
  readOnly?: boolean;
  disabled?: boolean;
  text?: Partial<RatingText>;
}

export function Rating({ label, value, onChange, count = 5, allowHalf = false, readOnly = false, disabled = false, text }: RatingProps) {
  const name = useFieldName(label);
  const words = { ...RATING_TEXT, ...text };
  const service = useMachine(ratingGroup.machine, {
    id: useId(),
    dir: pageDir(),
    value,
    count,
    allowHalf,
    readOnly,
    disabled,
    onValueChange: (d) => onChange(d.value),
    translations: { ratingValueText: (index) => words.star(index, count) },
  });
  const api = ratingGroup.connect(service, normalizeProps);
  return (
    <div data-glim="Rating" {...api.getRootProps()} className="glim-rating">
      <label {...api.getLabelProps()} className={label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name}
      </label>
      <div {...api.getControlProps()} className="glim-rating-control">
        {api.items.map((index) => (
          <span key={index} {...api.getItemProps({ index })} className="glim-rating-star">
            <IconStar />
            <span className="glim-rating-fill" aria-hidden="true">
              <IconStar />
            </span>
          </span>
        ))}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  );
}
