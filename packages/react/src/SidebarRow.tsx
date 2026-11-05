import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";
import { sidebarRowView } from "@glimstone/core";
import { useLabelMode } from "./useLabelMode.ts";
import { useTipBubble } from "./useTipBubble.tsx";

// One destination of the navigation rail; what it shows comes from
// sidebarRowView() in the core. The other props of an <a> go to the link, so a
// router can take the click.

export interface SidebarCount {
  value: number;
  /** The figure in words, such as "3 need attention", because a bare number
   *  names nothing. */
  label: string;
}

export interface SidebarRowProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** The destination's name: shown, or hidden but still the link's name. */
  label: string;
  /** The destination's glyph. Without one the row shows its name in every mode. */
  glyph?: ReactNode;
  /** Without one the row is a button. */
  href?: string;
  /** This destination is showing; the row is filled and marked as the current page. */
  active?: boolean;
  /** The row's rainbow position: its rank among the rows the rail shows, so a
   *  hidden row leaves no gap. */
  hueIndex?: number;
  /** The figure on the row, such as items that need attention. Nothing shows at zero. */
  count?: SidebarCount;
  /** What stands in the row before the link, such as a tree's toggle. */
  before?: ReactNode;
  /** What stands in the row after the link, such as a meter or a pin. The link's
   *  press still covers the rest of the row. */
  after?: ReactNode;
}

export function SidebarRow({ label, glyph, href, active = false, hueIndex, count, before, after, className = "", style, ...rest }: SidebarRowProps) {
  const mode = useLabelMode("sidebar");
  const view = sidebarRowView({ mode, label, hasGlyph: !!glyph, active, hueIndex, count: count?.value });
  const tooltip = useTipBubble(view.tip);
  const framed = before || after;
  const Element = (href ? "a" : "button") as "a";
  const own = href ? { href } : { type: "button" };
  const viewStyle = { ...view.style, ...style } as CSSProperties;
  const link = (
    <Element
      {...rest}
      {...own}
      ref={tooltip.ref}
      aria-current={active ? "page" : undefined}
      aria-describedby={tooltip.describedBy}
      {...tooltip.handlers}
      className={framed ? "glim-nav-row-main" : `${view.className} ${className}`.trim()}
      style={framed ? undefined : viewStyle}
    >
      {view.showGlyph && glyph}
      <span className={view.labelClass}>{label}</span>
      {view.countClass && (
        <>
          <span className={view.countClass} aria-hidden="true">
            {count!.value}
          </span>
          <span className="glim-sr-only">{count!.label}</span>
        </>
      )}
    </Element>
  );
  return (
    <>
      {framed ? (
        <div className={`${view.className} glim-nav-row--slots ${className}`.trim()} style={viewStyle}>
          {before && <span className="glim-nav-row-slot">{before}</span>}
          {link}
          {after && <span className="glim-nav-row-slot">{after}</span>}
        </div>
      ) : (
        link
      )}
      {tooltip.bubble}
    </>
  );
}
