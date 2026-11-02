// The shared switch control.
//
// The label is always the accessible name; `hideLabel` only drops the visible
// caption. Indenting a sub-switch is the caller's layout, per the design
// language's "flush, no indent" rule.

export interface ToggleProps {
  /** Current on/off state. */
  checked: boolean;
  /** Called with the flipped value when the switch is activated. */
  onChange: (next: boolean) => void;
  /** Always used as the accessible name; shown as visible text unless hideLabel. */
  label: string;
  /** Suppress the visible caption; the text stays as aria-label. Use it only
   *  when the caller draws the same text right next to the switch, never
   *  because a card title further up already says it. */
  hideLabel?: boolean;
  disabled?: boolean;
  /** Extra classes for the outer wrapper (e.g. row-alignment nudges). */
  className?: string;
}

export function Toggle({ checked, onChange, label, hideLabel = false, disabled, className }: ToggleProps) {
  return (
    <span className={`glim-toggle${className ? ` ${className}` : ""}`}>
      {!hideLabel && <span className="glim-toggle-label">{label}</span>}
      {/* No `title=`: the label is always visible beside the switch, so a
          tooltip would only repeat it. */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="glim-toggle-track"
      >
        <span className="glim-toggle-thumb" />
      </button>
    </span>
  );
}
