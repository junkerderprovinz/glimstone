import { children, createEffect, createMemo, Index, Match, on, onCleanup, Show, Switch, type JSX } from "solid-js";
import {
  keepReadmeFit,
  readmePartClass,
  readmePartLabel,
  readmeSoon,
  readmeUnitClass,
  type ReadmeBrand,
  type ReadmePart,
} from "@glimstone/core";
import { InfoBubble } from "./InfoBubble.tsx";

// A button in the shape of the README's download buttons, on the App tab and
// the About card ("The App tab" in design-language.md). The first part carries
// the mark and the full name; the parts after it are segments that name only
// what differs, such as ARM beside Windows. The unit lights up as one in its
// brand's colour ("Brand tiles"). A link where a part leads to a file or a
// listing, a button where it does something on the page, and a quiet unit with
// "Soon" as its second line where the listing does not exist yet.

export type { ReadmeBrand, ReadmePart } from "@glimstone/core";

export interface ReadmeButtonProps {
  /** The brand whose colour the unit lights up in. */
  brand: ReadmeBrand;
  /** The button, then its segments. */
  parts: [ReadmePart, ...ReadmePart[]];
  mark?: JSX.Element;
  /** The class that paints the mark at rest, such as `glim-windows-mark`. It
   *  sits on the mark's box, where the lit unit's ink can override it. */
  markClass?: string;
  /** A vendor's own button artwork, which replaces the first part's mark and words. */
  art?: JSX.Element;
  /** The "(i)" at the end of the unit, for what the name cannot say. */
  hint?: string;
  /** Holds the second lines in view while one reports what it did, such as "Copied". */
  note?: boolean;
  /** The second line of a unit whose first part has neither `href` nor `onClick`. */
  soonLabel?: string;
  /** Runs on a click on a part's link, for an app whose webview has no browser
   *  behind it to open the address in. */
  onLinkClick?: (e: MouseEvent) => void;
}

export function ReadmeButton(props: ReadmeButtonProps) {
  let root!: HTMLDivElement;
  const soon = createMemo(() => readmeSoon(props.parts));
  const words = () => props.parts.map((p) => `${p.name}\n${p.sub ?? ""}`).join("\n") + (soon() ? props.soonLabel : "");
  createEffect(on(words, () => onCleanup(keepReadmeFit(root))));
  const mark = children(() => props.mark);
  const art = children(() => props.art);

  return (
    <div data-glim="ReadmeButton" ref={root} class={readmeUnitClass(props.brand, props.parts.length, !!props.note, soon())}>
      <Index each={props.parts}>
        {(part, i) => {
          const sub = () => (soon() ? props.soonLabel : part().sub);
          const label = () => readmePartLabel(part(), sub());
          const className = () => readmePartClass(i, soon());
          const face = () => (
            <Show
              when={i === 0 && art()}
              fallback={
                <>
                  <Show when={i === 0 && mark()}>
                    <span class={`glim-readme-btn-mark ${props.markClass ?? ""}`} aria-hidden="true">
                      {mark()}
                    </span>
                  </Show>
                  <span class="glim-readme-btn-text">
                    <span class="glim-readme-btn-name">{part().name}</span>
                    <Show when={sub()}>
                      <span class="glim-readme-btn-sub">{sub()}</span>
                    </Show>
                  </span>
                </>
              }
            >
              <span class="glim-readme-btn-art" aria-hidden="true">
                {art()}
              </span>
            </Show>
          );
          return (
            <Switch
              fallback={
                <button type="button" onClick={() => part().onClick?.()} aria-label={label()} class={className()}>
                  {face()}
                </button>
              }
            >
              <Match when={soon()}>
                <span class={className()} aria-disabled="true" aria-label={label()}>
                  {face()}
                </span>
              </Match>
              <Match when={part().href}>
                <a href={part().href} target="_blank" rel="noreferrer noopener" onClick={(e) => props.onLinkClick?.(e)} aria-label={label()} class={className()}>
                  {face()}
                </a>
              </Match>
            </Switch>
          );
        }}
      </Index>
      <Show when={!soon()}>
        <span class="glim-readme-btn-sheen" aria-hidden="true" />
      </Show>
      <Show when={props.hint}>
        {(hint) => (
          <span class="glim-readme-btn-hint">
            <InfoBubble tip={hint()} />
          </span>
        )}
      </Show>
    </div>
  );
}

/** A vendor mark kept as its own markup, from appMarks.ts. */
export function BrandMark(props: { svg: string }) {
  return <span data-glim="BrandMark" class="glim-brand-svg" aria-hidden="true" innerHTML={props.svg} />;
}
