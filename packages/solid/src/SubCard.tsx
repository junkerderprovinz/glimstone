import { children, createUniqueId, Show, type JSX } from "solid-js";
import { Badge } from "./Badge.tsx";
import { InfoBubble } from "./InfoBubble.tsx";

/**
 * A flat, filled group inside a card or a window. It groups without a second
 * raised surface and takes the place of a fold-out, so nothing hides behind a
 * click. Fields and quiet buttons inside it step up one surface, so they do
 * not vanish into its fill.
 */
export function SubCard(props: {
  /** The group's name, drawn as a section badge on its top edge. */
  title?: string;
  /** One line on what the group does, drawn as an "(i)" inside the badge. */
  hint?: string;
  /** What belongs to the whole group, such as a switch, at the end of the
   *  heading's row. */
  end?: JSX.Element;
  children: JSX.Element;
}) {
  const titleId = createUniqueId();
  const end = children(() => props.end);
  return (
    <section
      data-glim="SubCard"
      data-glim-title={props.title}
      class={`glim-subcard${props.title ? " glim-subcard--titled" : ""}`}
      aria-labelledby={props.title ? titleId : undefined}
    >
      {/* The id is on the words alone, or the bubble's text would join the
          group's name. */}
      <Show when={props.title}>
        <h3 class="glim-panel-heading">
          <Badge tone="heading" size="heading" wrap>
            <span id={titleId}>{props.title}</span>
            <Show when={props.hint}>{(hint) => <InfoBubble tip={hint()} onAccent />}</Show>
          </Badge>
        </h3>
      </Show>
      <Show when={end()}>
        <div class="glim-subcard-end">{end()}</div>
      </Show>
      {props.children}
    </section>
  );
}
