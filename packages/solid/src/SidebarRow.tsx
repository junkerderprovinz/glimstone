import { children, createMemo, mergeProps, Show, splitProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { sidebarRowView, type SidebarCount } from "@glimstone/core";
import { useLabelMode } from "./engines.ts";
import { css } from "./style.ts";
import { useTipBubble } from "./useTipBubble.tsx";

export type { SidebarCount } from "@glimstone/core";

// One destination of the navigation rail; what it shows comes from
// sidebarRowView() in the core. The other props of an <a> go to the link, so a
// router can take the click.

export interface SidebarRowProps extends Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "class" | "style"> {
  /** The destination's name: shown, or hidden but still the link's name. */
  label: string;
  /** The destination's glyph. Without one the row shows its name in every mode. */
  glyph?: JSX.Element;
  /** Without one the row is a button. */
  href?: string;
  /** This destination is showing; the row is filled and marked as the current page. */
  active?: boolean;
  /** The row's rainbow position: its rank among the rows the rail shows, so a
   *  hidden row leaves no gap. */
  hueIndex?: number;
  /** The figure on the row, such as items that need attention. Nothing shows at zero. */
  count?: SidebarCount;
  /** A tree's row at this level, stepped in with a smaller glyph and gap. */
  depth?: number;
  /** What stands in the row before the link, such as a tree's toggle. */
  before?: JSX.Element;
  /** What stands in the row after the link, such as a meter or a pin. The link's
   *  press still covers the rest of the row. */
  after?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

export function SidebarRow(props: SidebarRowProps) {
  const merged = mergeProps({ active: false, class: "" }, props);
  const [own, rest] = splitProps(merged, ["label", "glyph", "href", "active", "hueIndex", "count", "depth", "before", "after", "class", "style"]);
  const mode = useLabelMode("sidebar");
  const glyph = children(() => own.glyph);
  const before = children(() => own.before);
  const after = children(() => own.after);
  const framed = () => !!(before() || after());
  const view = createMemo(() =>
    sidebarRowView({
      mode: mode(),
      label: own.label,
      hasGlyph: !!glyph(),
      active: own.active,
      hueIndex: own.hueIndex,
      count: own.count?.value,
      framed: framed(),
      depth: own.depth,
    }),
  );
  const tooltip = useTipBubble(() => view().tip);
  const viewStyle = () => ({ ...css(view().style), ...own.style });
  const link = (
    <Dynamic
      component={own.href ? "a" : "button"}
      data-glim={framed() ? undefined : "SidebarRow"}
      {...rest}
      href={own.href}
      type={own.href ? undefined : "button"}
      ref={tooltip.ref}
      aria-current={own.active ? "page" : undefined}
      aria-describedby={tooltip.describedBy()}
      {...tooltip.handlers}
      class={framed() ? "glim-nav-row-main" : `${view().className} ${own.class}`.trim()}
      style={framed() ? undefined : viewStyle()}
    >
      <Show when={view().showGlyph}>{glyph()}</Show>
      <span class={view().labelClass}>{own.label}</span>
      <Show when={view().countClass}>
        <span class={view().countClass} aria-hidden="true">
          {own.count!.value}
        </span>
        <span class="glim-sr-only">{own.count!.label}</span>
      </Show>
    </Dynamic>
  );
  return (
    <>
      <Show when={framed()} fallback={link}>
        <div data-glim="SidebarRow" class={`${view().className} glim-nav-row--slots ${own.class}`.trim()} style={viewStyle()}>
          <Show when={before()}>
            <span class="glim-nav-row-slot">{before()}</span>
          </Show>
          {link}
          <Show when={after()}>
            <span class="glim-nav-row-slot">{after()}</span>
          </Show>
        </div>
      </Show>
      {tooltip.bubble}
    </>
  );
}
