import { children, For, Show, splitProps, type JSX } from "solid-js";
import { hueVars, type InstanceFigure } from "@glimstone/core";
import { css } from "./style.ts";

export type { InstanceFigure } from "@glimstone/core";

// One instance as a card in the Instances grid, or one app of the fortress
// with a row for each place it runs ("The fortress" in the design language).
// The mark stands at the start, the name with its badges beside it, and the
// actions at the end of the card's foot.

export interface InstanceCardProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "class" | "style"> {
  /** The app's mark, as an address or as an inline `<svg>`. */
  logo?: string | JSX.Element;
  /** The device's name for an instance of this app, the app's name for another app. */
  name: string;
  eyebrow?: string;
  /** Badges after the name, such as the state. */
  badges?: JSX.Element;
  /** One quiet line of facts, joined with a dot. Empty ones are left out. */
  facts?: (string | undefined)[];
  /** A few numbers under the facts, each with its small label. */
  figures?: InstanceFigure[];
  /** What the card holds under the head, such as a row per instance. */
  children?: JSX.Element;
  /** The card's buttons. Without a body they stand beside the mark. */
  actions?: JSX.Element;
  /** The card's position in the rainbow, counted over the cards on the page. */
  hueIndex?: number;
  class?: string;
  style?: JSX.CSSProperties;
}

export function InstanceCard(props: InstanceCardProps) {
  const [own, rest] = splitProps(props, ["logo", "name", "eyebrow", "badges", "facts", "figures", "children", "actions", "hueIndex", "class", "style"]);
  const shown = () => own.facts?.filter(Boolean) ?? [];
  const logo = children(() => own.logo);
  const badges = children(() => own.badges);
  const body = children(() => own.children);
  const actions = children(() => own.actions);
  // The actions stand in one of two places, so they are drawn where they are asked for.
  const acts = () => (actions() ? <div class="glim-instance-acts">{actions()}</div> : undefined);
  return (
    <div
      data-glim="InstanceCard"
      data-glim-title={own.name}
      {...rest}
      class={["glim-card glim-instance", own.hueIndex !== undefined && "glim-hue", own.class].filter(Boolean).join(" ")}
      style={own.hueIndex !== undefined ? { ...css(hueVars(own.hueIndex)), ...own.style } : own.style}
    >
      <div class="glim-instance-top">
        <Show
          when={typeof own.logo === "string"}
          fallback={
            <Show when={logo()}>
              <span class="glim-instance-mark" aria-hidden="true">
                {logo()}
              </span>
            </Show>
          }
        >
          <img class="glim-instance-mark" src={own.logo as string} alt="" draggable="false" />
        </Show>
        <div class="glim-instance-main">
          <div class="glim-instance-name">
            <h3 class="glim-instance-title">{own.name}</h3>
            <Show when={badges()}>
              <span class="glim-instance-badges">{badges()}</span>
            </Show>
          </div>
          <Show when={own.eyebrow}>
            <span class="glim-eyebrow">{own.eyebrow}</span>
          </Show>
          <Show when={shown().length > 0}>
            <p class="glim-instance-facts glim-num">{shown().join(" · ")}</p>
          </Show>
          <Show when={own.figures && own.figures.length > 0}>
            <dl class="glim-instance-figures">
              <For each={own.figures}>
                {(f) => (
                  <div>
                    <dt>{f.label}</dt>
                    <dd class="glim-num">{f.value}</dd>
                  </div>
                )}
              </For>
            </dl>
          </Show>
          <Show when={!body()}>{acts()}</Show>
        </div>
      </div>
      <Show when={body()}>
        <div class="glim-instance-body">{body()}</div>
        {acts()}
      </Show>
    </div>
  );
}
