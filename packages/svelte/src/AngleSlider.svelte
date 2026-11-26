<script lang="ts" module>
  export interface AngleSliderProps {
    label?: string;
    /** The angle, bound with `bind:value`. */
    value: number;
    onChange?: (value: number) => void;
    step?: number;
    /** The angles that carry a tick on the dial. A tick on a quarter is longer. */
    marks?: number[];
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import type { KeyboardEventHandler } from "svelte/elements";
  import * as angleSlider from "@zag-js/angle-slider";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { ANGLE_MARKS, angleKeyTarget, pageDir } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";

  // An angle set on a dial, such as how far a picture turns. The dial is round
  // whatever the shape setting, since a circle is its geometry and not a corner.
  // A hand points from the middle to the knob, and the value stands in the
  // middle in degrees, left to right in every language. It snaps every 15
  // degrees unless `step` asks for finer, with a tick at each snap. Inside a
  // FieldRow the row names it.

  let { label, value = $bindable(), onChange, step = 15, marks = ANGLE_MARKS, disabled = false }: AngleSliderProps = $props();

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
  // Zag sends End to 359 whatever the step, so Home and End are answered here.
  const thumb = $derived.by(() => {
    const own = api.getThumbProps();
    const onkeydown: KeyboardEventHandler<HTMLElement> = (e) => {
      const to = angleKeyTarget(e.key, step);
      if (to === undefined) return own.onkeydown?.(e);
      e.preventDefault();
      api.setValue(to);
    };
    return { ...own, onkeydown };
  });
  // A turn past 0° would spring the long way round, so that step lands at once.
  let last: number | undefined;
  const across = $derived.by(() => {
    const turn = last !== undefined && Math.abs(api.value - last) > 180;
    last = api.value;
    return turn;
  });
</script>

<div data-glim="AngleSlider" {...api.getRootProps()} class="glim-angle">
  <label {...api.getLabelProps()} class={label === undefined ? "glim-sr-only" : "glim-field-label"}>{name()}</label>
  <div class="glim-angle-body">
    <div {...api.getControlProps()} class="glim-angle-dial">
      <div {...api.getMarkerGroupProps()} class="glim-angle-marks">
        {#each marks as mark (mark)}
          <span {...api.getMarkerProps({ value: mark })} data-quarter={mark % 90 === 0 ? "" : undefined} class="glim-angle-mark"></span>
        {/each}
      </div>
      <div {...thumb} aria-valuetext={`${api.value}°`} data-across={across ? "" : undefined} class="glim-angle-thumb">
        <span class="glim-angle-hand"></span>
      </div>
      <div {...api.getValueTextProps()} class="glim-angle-value glim-num">{`${api.value}°`}</div>
    </div>
  </div>
  <input {...api.getHiddenInputProps()} />
</div>
