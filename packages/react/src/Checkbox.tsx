import { IconCheck } from "./glyphs.tsx";

// The checkbox, for the places a box stands instead of a switch (rule 39):
// "Don't show again" under a notice, and choices that are applied together,
// such as which columns a list shows. Every setting is a Toggle.

export interface CheckboxProps {
  checked: boolean;
  /** Called with the flipped value when the box is activated. */
  onChange: (next: boolean) => void;
  /** Always the accessible name; shown beside the box unless hideLabel. */
  label: string;
  /** For a grid whose row and column headings already say it, such as permissions. */
  hideLabel?: boolean;
  /** The box alone, without the frame and its hover ground, for a row or a cell of a dense list. Hides the label. */
  slim?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, label, hideLabel = false, slim = false, disabled, className }: CheckboxProps) {
  const bare = hideLabel || slim;
  const classes = ["glim-checkbox", slim && "glim-checkbox--slim", className].filter(Boolean).join(" ");
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={bare ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={classes}
    >
      <span className="glim-checkbox-box" aria-hidden="true">
        <IconCheck />
      </span>
      {!bare && <span>{label}</span>}
    </button>
  );
}
