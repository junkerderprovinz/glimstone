import { createMemo, createSignal, createUniqueId, For, mergeProps } from "solid-js";
import * as ratingGroup from "@zag-js/rating-group";
import { normalizeProps, useMachine } from "@zag-js/solid";
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

export function Rating(raw: RatingProps) {
  const props = mergeProps({ count: 5, allowHalf: false, readOnly: false, disabled: false }, raw);
  const id = createUniqueId();
  const name = useFieldName(() => props.label);
  const words = () => ({ ...RATING_TEXT, ...props.text });
  // Counts the picks: the stylesheet names one spring per parity, so a second
  // pick of the same star springs again.
  const [picks, setPicks] = createSignal(0);
  const service = useMachine(ratingGroup.machine, () => ({
    id,
    dir: pageDir(),
    value: props.value,
    count: props.count,
    allowHalf: props.allowHalf,
    readOnly: props.readOnly,
    disabled: props.disabled,
    onValueChange: (d: { value: number }) => {
      setPicks((n) => n + 1);
      props.onChange(d.value);
    },
    translations: { ratingValueText: (index: number) => words().star(index, props.count) },
  }));
  const api = createMemo(() => ratingGroup.connect(service, normalizeProps));
  return (
    <div data-glim="Rating" {...api().getRootProps()} class="glim-rating">
      <label {...api().getLabelProps()} class={props.label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name()}
      </label>
      <div {...api().getControlProps()} class="glim-rating-control">
        <For each={api().items}>
          {(index) => (
            <span
              {...api().getItemProps({ index })}
              data-pop={picks() > 0 && index === Math.ceil(api().value) ? (picks() % 2 ? "odd" : "even") : undefined}
              style={{ "--i": String(index - 1) }}
              class="glim-rating-star"
            >
              <IconStar />
              <span class="glim-rating-fill" aria-hidden="true">
                <IconStar />
              </span>
            </span>
          )}
        </For>
      </div>
      <input {...api().getHiddenInputProps()} />
    </div>
  );
}
