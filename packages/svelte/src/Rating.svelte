<script lang="ts" module>
  import type { RatingText } from "@glimstone/core";

  export type { RatingText } from "@glimstone/core";

  export interface RatingProps {
    label?: string;
    /** The value, bound with `bind:value`. */
    value: number;
    onChange?: (value: number) => void;
    count?: number;
    /** Takes half stars, from the pointer and from the arrows. */
    allowHalf?: boolean;
    /** Shows the value and takes no input, such as an average. */
    readOnly?: boolean;
    disabled?: boolean;
    text?: Partial<RatingText>;
  }
</script>

<script lang="ts">
  import * as ratingGroup from "@zag-js/rating-group";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { RATING_TEXT, pageDir } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";
  import { IconStar } from "./glyphs.js";

  // A value given in stars, such as how well a release worked. The stars up to
  // the value are filled with the accent, the rest stand on the third surface.
  // It is a radio group: the arrows move the value, and a pointer over a star
  // shows what a press would give. Inside a FieldRow the row names it.
  let { label, value = $bindable(), onChange, count = 5, allowHalf = false, readOnly = false, disabled = false, text }: RatingProps = $props();

  const name = useFieldName(() => label);
  const words = $derived({ ...RATING_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(ratingGroup.machine, () => ({
    id,
    dir: pageDir(),
    value,
    count,
    allowHalf,
    readOnly,
    disabled,
    onValueChange: (d: { value: number }) => {
      value = d.value;
      onChange?.(d.value);
    },
    translations: { ratingValueText: (index: number) => words.star(index, count) },
  }));
  const api = $derived(ratingGroup.connect(service, normalizeProps));
</script>

<div data-glim="Rating" {...api.getRootProps()} class="glim-rating">
  <label {...api.getLabelProps()} class={label === undefined ? "glim-sr-only" : "glim-field-label"}>{name()}</label>
  <div {...api.getControlProps()} class="glim-rating-control">
    {#each api.items as index (index)}
      <span {...api.getItemProps({ index })} class="glim-rating-star">
        {@render IconStar()}
        <span class="glim-rating-fill" aria-hidden="true">{@render IconStar()}</span>
      </span>
    {/each}
  </div>
  <input {...api.getHiddenInputProps()} />
</div>
