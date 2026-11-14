import { children, Show, splitProps, type JSX } from "solid-js";
import { InfoBubble } from "./InfoBubble.tsx";

// One row of a list: a glyph tile, the name, badges and buttons that come in on
// hover and focus (rule 6). A click handler makes the whole row a way into its
// object, by keyboard too. The other props of a <div> go to the row.

export interface ListRowProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "class"> {
  name: string;
  /** More about the row, drawn as an "(i)" beside the name. */
  tip?: string | null;
  /** Sets the name in monospace, for a path. */
  mono?: boolean;
  /** The glyph at the row's start, which fills with the accent while the row is reached. */
  tile?: JSX.Element;
  /** What stands at the row's end at rest. */
  badges?: JSX.Element;
  /** The buttons that come in on hover and focus. A press on one does not open the row. */
  actions?: JSX.Element;
  class?: string;
}

const stay = (e: MouseEvent) => e.stopPropagation();

export function ListRow(props: ListRowProps) {
  const [own, rest] = splitProps(props, ["name", "tip", "mono", "tile", "badges", "actions", "class", "onClick", "onKeyDown"]);
  const keys: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    if (typeof own.onKeyDown === "function") own.onKeyDown(e);
    if (!own.onClick || e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    e.currentTarget.click();
  };
  // Each is read twice, to test and to draw, so it is resolved once.
  const tile = children(() => own.tile);
  const badges = children(() => own.badges);
  const actions = children(() => own.actions);
  const classes = () => ["glim-list-row", own.onClick && "glim-list-row--opens", own.class].filter(Boolean).join(" ");
  return (
    <div data-glim="ListRow" role="group" aria-label={own.name} tabIndex={own.onClick ? 0 : undefined} {...rest} onClick={own.onClick} onKeyDown={keys} class={classes()}>
      <Show when={tile()}>
        <span class="glim-list-row-tile">{tile()}</span>
      </Show>
      <span class={own.mono ? "glim-list-row-name glim-list-row-name--mono" : "glim-list-row-name"}>
        <span class="glim-list-row-title">{own.name}</span>
        <Show when={own.tip}>
          {(tip) => (
            <span class="glim-list-row-tip" onClick={stay}>
              <InfoBubble tip={tip()} />
            </span>
          )}
        </Show>
      </span>
      <Show when={badges()}>
        <span class="glim-list-row-badges">{badges()}</span>
      </Show>
      <Show when={actions()}>
        <span class="glim-list-row-actions" onClick={stay}>
          {actions()}
        </span>
      </Show>
    </div>
  );
}
