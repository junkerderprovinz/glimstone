<script lang="ts" module>
  import type { SignaturePadText } from "@glimstone/core";

  export type { SignaturePadText } from "@glimstone/core";

  export interface SignaturePadProps {
    label: string;
    /** The strokes as SVG path data, one entry a stroke, bound with `bind:value`. */
    value: string[];
    onChange?: (value: string[]) => void;
    disabled?: boolean;
    text?: Partial<SignaturePadText>;
  }
</script>

<script lang="ts">
  import * as signaturePad from "@zag-js/signature-pad";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { SIGNATURE_PAD_TEXT, pageDir } from "@glimstone/core";
  import Button from "./Button.svelte";
  import { IconResetArrow } from "./glyphs.js";

  // A signature drawn with a mouse, a pen or a finger, such as the approval of
  // a handover. The strokes are SVG paths, drawn in the text colour on the
  // second surface over a hairline to sign on, and the paths are the value.
  let { label, value = $bindable(), onChange, disabled = false, text }: SignaturePadProps = $props();

  const words = $derived({ ...SIGNATURE_PAD_TEXT, ...text });
  const id = $props.id();

  function set(paths: string[]) {
    value = paths;
    onChange?.(paths);
  }

  const service = useMachine(signaturePad.machine, () => ({
    id,
    dir: pageDir(),
    paths: value,
    disabled,
    drawing: { fill: "currentColor", size: 2, simulatePressure: true },
    // Controlled, the machine hands a finished stroke over through onDraw. While
    // a stroke is under way it reports it as currentPath.
    onDraw: (d: { paths: string[]; currentPath: string | null }) => d.currentPath === null && set(d.paths),
    translations: { control: words.area, clearTrigger: words.clear },
  }));
  const api = $derived(signaturePad.connect(service, normalizeProps));

  function clear() {
    api.clear();
    set([]);
  }
</script>

<div data-glim="SignaturePad" {...api.getRootProps()} class="glim-signature">
  <label {...api.getLabelProps()} class="glim-field-label">{label}</label>
  <div {...api.getControlProps()} class="glim-signature-pad">
    <svg {...api.getSegmentProps()} class="glim-signature-ink">
      {#each api.paths as path, i (i)}
        <path {...api.getSegmentPathProps({ path })} />
      {/each}
      {#if api.currentPath}
        <path {...api.getSegmentPathProps({ path: api.currentPath })} />
      {/if}
    </svg>
    <div {...api.getGuideProps()} class="glim-signature-guide"></div>
  </div>
  <div class="glim-signature-foot">
    <Button label={words.clear} labelKey={null} glyph={IconResetArrow} disabled={api.empty || disabled} onClick={clear} />
  </div>
  <input {...api.getHiddenInputProps({ value: api.paths.join(" ") })} />
</div>
