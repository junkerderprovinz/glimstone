import { IconCheck } from "./glyphs.tsx";

// The checkbox, for the one place a box stands instead of a switch: "Don't show
// again" under a notice (rule 39), and a column of choices that are applied
// together, such as which columns a list shows. Every setting is a Toggle.

export interface CheckboxProps {
  checked: boolean;
  /** Called with the flipped value when the box is activated. */
  onChange: (next: boolean) => void;
  /** Always the accessible name; shown beside the box unless hideLabel. */
  label: string;
  /** For a grid whose row and column headings already say it, such as permissions. */
  hideLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, label, hideLabel = false, disabled, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={className ? `glim-checkbox ${className}` : "glim-checkbox"}
    >
      <span className="glim-checkbox-box" aria-hidden="true">
        <IconCheck />
      </span>
      {!hideLabel && <span>{label}</span>}
    </button>
  );
}
