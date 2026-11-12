import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { hueVars } from "@glimstone/core";

// One instance as a card in the Instances grid, or one app of the fortress
// with a row for each place it runs ("The fortress" in the design language).
// The mark stands at the start, the name with its badges beside it, and the
// actions at the end of the card's foot.

export interface InstanceFigure {
  value: string;
  label: string;
}

export interface InstanceCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The app's mark, as an address or as an inline `<svg>`. */
  logo?: string | ReactNode;
  /** The device's name for an instance of this app, the app's name for another app. */
  name: string;
  eyebrow?: string;
  /** Badges after the name, such as the state. */
  badges?: ReactNode;
  /** One quiet line of facts, joined with a dot. Empty ones are left out. */
  facts?: (string | undefined)[];
  /** A few numbers under the facts, each with its small label. */
  figures?: InstanceFigure[];
  /** What the card holds under the head, such as a row per instance. */
  children?: ReactNode;
  /** The card's buttons. Without a body they stand beside the mark. */
  actions?: ReactNode;
  /** The card's position in the rainbow, counted over the cards on the page. */
  hueIndex?: number;
}

export function InstanceCard({ logo, name, eyebrow, badges, facts, figures, children, actions, hueIndex, className, style, ...rest }: InstanceCardProps) {
  const shown = facts?.filter(Boolean) ?? [];
  const acts = actions && <div className="glim-instance-acts">{actions}</div>;
  return (
    <div
      data-glim="InstanceCard"
      data-glim-title={name}
      {...rest}
      className={["glim-card glim-instance", hueIndex !== undefined && "glim-hue", className].filter(Boolean).join(" ")}
      style={hueIndex !== undefined ? ({ ...hueVars(hueIndex), ...style } as CSSProperties) : style}
    >
      <div className="glim-instance-top">
        {typeof logo === "string" ? (
          <img className="glim-instance-mark" src={logo} alt="" draggable={false} />
        ) : (
          logo && (
            <span className="glim-instance-mark" aria-hidden="true">
              {logo}
            </span>
          )
        )}
        <div className="glim-instance-main">
          <div className="glim-instance-name">
            <h3 className="glim-instance-title">{name}</h3>
            {badges && <span className="glim-instance-badges">{badges}</span>}
          </div>
          {eyebrow && <span className="glim-eyebrow">{eyebrow}</span>}
          {shown.length > 0 && <p className="glim-instance-facts glim-num">{shown.join(" · ")}</p>}
          {figures && figures.length > 0 && (
            <dl className="glim-instance-figures">
              {figures.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd className="glim-num">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {!children && acts}
        </div>
      </div>
      {children && <div className="glim-instance-body">{children}</div>}
      {children && acts}
    </div>
  );
}
