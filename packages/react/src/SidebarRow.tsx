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
  href: string;
  /** This destination is showing; the row is filled and marked as the current page. */
  active?: boolean;
  /** The row's rainbow position: its rank among the rows the rail shows, so a
   *  hidden row leaves no gap. */
  hueIndex?: number;
  /** The figure on the row, such as items that need attention. Nothing shows at zero. */
  count?: SidebarCount;
}

export function SidebarRow({ label, glyph, href, active = false, hueIndex, count, className = "", ...rest }: SidebarRowProps) {
  const mode = useLabelMode("sidebar");
  const view = sidebarRowView({ mode, label, hasGlyph: !!glyph, active, hueIndex, count: count?.value });
  const tooltip = useTipBubble(view.tip);
  return (
    <>
      <a
        {...rest}
        ref={tooltip.ref}
        href={href}
        aria-current={active ? "page" : undefined}
        aria-describedby={tooltip.describedBy}
        {...tooltip.handlers}
        className={`${view.className} ${className}`.trim()}
        style={view.style as CSSProperties}
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
      </a>
      {tooltip.bubble}
    </>
  );
}
