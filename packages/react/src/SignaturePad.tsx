import { useId } from "react";
import * as signaturePad from "@zag-js/signature-pad";
import { normalizeProps, useMachine } from "@zag-js/react";
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

export function SignaturePad({ label, value, onChange, disabled = false, text }: SignaturePadProps) {
  const words = { ...SIGNATURE_PAD_TEXT, ...text };
  const service = useMachine(signaturePad.machine, {
    id: useId(),
    dir: pageDir(),
    paths: value,
    disabled,
    drawing: { fill: "currentColor", size: 2, simulatePressure: true },
    // Controlled, the machine hands a finished stroke over through onDraw. While
    // a stroke is under way it reports it as currentPath.
    onDraw: (d) => d.currentPath === null && onChange(d.paths),
    translations: { control: words.area, clearTrigger: words.clear },
  });
  const api = signaturePad.connect(service, normalizeProps);
  const clear = () => {
    api.clear();
    onChange([]);
  };
  return (
    <div data-glim="SignaturePad" {...api.getRootProps()} className="glim-signature">
      <label {...api.getLabelProps()} className="glim-field-label">
        {label}
      </label>
      <div {...api.getControlProps()} className="glim-signature-pad">
        <svg {...api.getSegmentProps()} className="glim-signature-ink">
          {api.paths.map((path, i) => (
            <path key={i} {...api.getSegmentPathProps({ path })} />
          ))}
          {api.currentPath && <path {...api.getSegmentPathProps({ path: api.currentPath })} />}
        </svg>
        <div {...api.getGuideProps()} className="glim-signature-guide" />
      </div>
      <div className="glim-signature-foot">
        <Button label={words.clear} labelKey={null} glyph={<IconResetArrow />} disabled={api.empty || disabled} onClick={clear} />
      </div>
      <input {...api.getHiddenInputProps({ value: api.paths.join(" ") })} />
    </div>
  );
}
