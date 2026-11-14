import { createMemo, createUniqueId, Index, mergeProps, Show } from "solid-js";
import * as signaturePad from "@zag-js/signature-pad";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { SIGNATURE_PAD_TEXT, pageDir, type SignaturePadText } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconResetArrow } from "./glyphs.tsx";

export type { SignaturePadText } from "@glimstone/core";

// A signature drawn with a mouse, a pen or a finger, such as the approval of
// a handover. The strokes are SVG paths, drawn in the text colour on the
// second surface over a hairline to sign on, and the paths are the value.

export interface SignaturePadProps {
  label: string;
  /** The strokes as SVG path data, one entry a stroke. */
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  text?: Partial<SignaturePadText>;
}

export function SignaturePad(raw: SignaturePadProps) {
  const props = mergeProps({ disabled: false }, raw);
  const id = createUniqueId();
  const words = () => ({ ...SIGNATURE_PAD_TEXT, ...props.text });
  const service = useMachine(signaturePad.machine, () => ({
    id,
    dir: pageDir(),
    paths: props.value,
    disabled: props.disabled,
    drawing: { fill: "currentColor", size: 2, simulatePressure: true },
    // Controlled, the machine hands a finished stroke over through onDraw. While
    // a stroke is under way it reports it as currentPath.
    onDraw: (d: { paths: string[]; currentPath: string | null }) => d.currentPath === null && props.onChange(d.paths),
    translations: { control: words().area, clearTrigger: words().clear },
  }));
  const api = createMemo(() => signaturePad.connect(service, normalizeProps));
  const clear = () => {
    api().clear();
    props.onChange([]);
  };
  return (
    <div data-glim="SignaturePad" {...api().getRootProps()} class="glim-signature">
      <label {...api().getLabelProps()} class="glim-field-label">
        {props.label}
      </label>
      <div {...api().getControlProps()} class="glim-signature-pad">
        <svg {...api().getSegmentProps()} class="glim-signature-ink">
          <Index each={api().paths}>{(path) => <path {...api().getSegmentPathProps({ path: path() })} />}</Index>
          <Show when={api().currentPath}>{(path) => <path {...api().getSegmentPathProps({ path: path() })} />}</Show>
        </svg>
        <div {...api().getGuideProps()} class="glim-signature-guide" />
      </div>
      <div class="glim-signature-foot">
        <Button label={words().clear} labelKey={null} glyph={<IconResetArrow />} disabled={api().empty || props.disabled} onClick={clear} />
      </div>
      <input {...api().getHiddenInputProps({ value: api().paths.join(" ") })} />
    </div>
  );
}
