<script lang="ts" module>
  export interface SliderProps {
    label?: string;
    /** The value, bound with `bind:value`. */
    value: number;
    onChange?: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    /** How the value reads, on screen and to a screen reader. */
    format: (value: number) => string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import * as slider from "@zag-js/slider";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { useFieldName } from "./fieldName.js";

  // A value on a range, for numbers people adjust rather than type. The value
  // stands beside the label in words ("30 days"), and the same words are what a
  // screen reader hears, through `format`. Inside a FieldRow the row names it and
  // draws the words.
  let { label, value = $bindable(), onChange, min, max, step = 1, format, disabled }: SliderProps = $props();

  const name = useFieldName(() => label);
  const id = $props.id();
  const service = useMachine(slider.machine, () => ({
    id,
    value: [value],
    min,
    max,
    step,
    disabled,
    onValueChange: (d: { value: number[] }) => {
      value = d.value[0]!;
      onChange?.(value);
    },
    getAriaValueText: (d: { value: number }) => format(d.value),
  }));
  const api = $derived(slider.connect(service, normalizeProps));
</script>

<div data-glim="Slider" {...api.getRootProps()} class="glim-slider">
  <div class="glim-slider-head">
    <label {...api.getLabelProps()} class={label === undefined ? "glim-sr-only" : "glim-field-label"}>{name()}</label>
    <output {...api.getValueTextProps()} class="glim-slider-value">{format(api.value[0]!)}</output>
  </div>
  <div {...api.getControlProps()} class="glim-slider-control">
    <div {...api.getTrackProps()} class="glim-slider-track">
      <div {...api.getRangeProps()} class="glim-slider-range"></div>
    </div>
    {#each api.value as _, index (index)}
      <div {...api.getThumbProps({ index })} class="glim-slider-thumb">
        <input {...api.getHiddenInputProps({ index })} />
      </div>
    {/each}
  </div>
</div>
