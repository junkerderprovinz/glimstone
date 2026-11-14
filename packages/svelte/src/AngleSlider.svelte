<script lang="ts" module>
  export interface AngleSliderProps {
    label?: string;
    /** The angle, bound with `bind:value`. */
    value: number;
    onChange?: (value: number) => void;
    step?: number;
    /** The angles that carry a tick on the dial. */
    marks?: number[];
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import * as angleSlider from "@zag-js/angle-slider";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { pageDir } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";

  // An angle set on a dial, such as how far a picture turns. The dial is round
  // whatever the shape setting, since a circle is its geometry and not a corner,
  // and the value stands beside it in degrees, left to right in every language.
  // Inside a FieldRow the row names it.
  let { label, value = $bindable(), onChange, step = 1, marks = [0, 90, 180, 270], disabled = false }: AngleSliderProps = $props();

  const name = useFieldName(() => label);
  const id = $props.id();
  const service = useMachine(angleSlider.machine, () => ({
    id,
    dir: pageDir(),
    value,
    step,
    disabled,
    onValueChange: (d: { value: number }) => {
      value = d.value;
      onChange?.(d.value);
    },
  }));
  const api = $derived(angleSlider.connect(service, normalizeProps));
</script>

<div data-glim="AngleSlider" {...api.getRootProps()} class="glim-angle">
  <label {...api.getLabelProps()} class={label === undefined ? "glim-sr-only" : "glim-field-label"}>{name()}</label>
  <div class="glim-angle-body">
    <div {...api.getControlProps()} class="glim-angle-dial">
      <div {...api.getMarkerGroupProps()} class="glim-angle-marks">
        {#each marks as mark (mark)}
          <span {...api.getMarkerProps({ value: mark })} class="glim-angle-mark"></span>
        {/each}
      </div>
      <div {...api.getThumbProps()} aria-valuetext={`${api.value}°`} class="glim-angle-thumb"></div>
    </div>
    <div {...api.getValueTextProps()} class="glim-angle-value glim-num">{`${api.value}°`}</div>
  </div>
  <input {...api.getHiddenInputProps()} />
</div>
