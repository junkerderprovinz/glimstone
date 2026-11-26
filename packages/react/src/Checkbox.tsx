// The checkbox, for the places a box stands instead of a switch (rule 39):
// "Don't show again" under a notice, and choices that are applied together,
// such as which columns a list shows. Every setting is a Toggle. It is a
// button for its look, and like a native checkbox only Space flips it.

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
      data-glim="Checkbox"
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={bare ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      className={classes}
    >
      <span className="glim-checkbox-box" aria-hidden="true">
        {/* The tick draws itself in as its dash closes. */}
        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" className="glim-mark">
          <path
            d="M3 7.4 5.7 10 11 4.2"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={checked ? 0 : 1}
            className="glim-checkbox-tick"
          />
        </svg>
      </span>
      {!bare && <span>{label}</span>}
    </button>
  );
}
