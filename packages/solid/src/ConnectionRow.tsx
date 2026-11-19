import { children, createMemo, Index, Show, splitProps, type JSX } from "solid-js";
import { connectionButtons, connectionTestFace, connectionTile, type ConnectionAction as CoreConnectionAction, type ConnectionRowLabelKeys, type ConnectionRowText, type ConnectionTest, type TileMark } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { BrandMark } from "./ReadmeButton.tsx";
import { IconCheck, IconClose } from "./glyphs.tsx";
import { css } from "./style.ts";

export type { ConnectionRowLabelKeys, ConnectionRowText, ConnectionTest } from "@glimstone/core";

export type ConnectionAction = CoreConnectionAction<JSX.Element>;

// A connected service or account as a compact row ("Connections" in the design
// language): its mark lit on a tile the row's whole height, its name with any
// badges, one quiet line on how it stands, and at the end the app's own
// actions, then its test, edit and remove. A built-in button stands only where
// its handler is passed. The other props of a <div> go to the row.

export interface ConnectionRowProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "class"> {
  /** The service's name, also the row's accessible name. */
  name: string;
  /** A brand's mark from a catalog, which stands on its own colour, or one of the app's glyphs, which stands on the accent. */
  mark: TileMark | JSX.Element;
  /** One quiet line under the name, such as who is signed in or where it connects. */
  status?: string;
  /** Badges after the name, for a state that is not the normal case, such as a failed connection. */
  badges?: JSX.Element;
  /** More quiet lines under the status, such as what uses the connection. */
  children?: JSX.Element;
  /** Where the test stands: `busy` while it runs, then `tone` and a `title` with what it found. */
  test?: ConnectionTest;
  /** Buttons of the app's own, such as Mount, before Test, Edit and Remove, so those keep their places at the end. */
  actions?: ConnectionAction[];
  text: ConnectionRowText;
  labelKeys?: Partial<ConnectionRowLabelKeys>;
  onTest?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  class?: string;
}

// On a phone the buttons show their glyphs alone, so they keep to one line.
const NARROW = 640;

export function ConnectionRow(props: ConnectionRowProps) {
  const [own, rest] = splitProps(props, ["name", "mark", "status", "badges", "children", "test", "actions", "text", "labelKeys", "onTest", "onEdit", "onRemove", "class"]);
  // A glyph is drawn anew on every read, so the mark is read once.
  const mark = createMemo(() => own.mark);
  const tile = () => connectionTile(mark());
  const buttons = createMemo(() => connectionButtons(own));
  // Read twice, to test and to draw, so it is resolved once.
  const badges = children(() => own.badges);
  return (
    <div data-glim="ConnectionRow" role="group" aria-label={own.name} {...rest} class={["glim-well glim-connection", own.class].filter(Boolean).join(" ")}>
      <span class="glim-connection-tile" style={css(tile().style)} aria-hidden="true">
        <span class="glim-connection-mark">
          <Show when={tile().svg} fallback={mark() as JSX.Element}>
            {(svg) => <BrandMark svg={svg()} />}
          </Show>
        </span>
      </span>
      <div class="glim-connection-main">
        <div class="glim-connection-head">
          <span class="glim-connection-name">{own.name}</span>
          <Show when={badges()}>
            <span class="glim-connection-badges">{badges()}</span>
          </Show>
        </div>
        <div class="glim-connection-foot">
          <div class="glim-connection-about">
            <Show when={own.status}>
              <p class="glim-connection-status">{own.status}</p>
            </Show>
            {own.children}
          </div>
          <Show when={buttons().length > 0}>
            <span class="glim-connection-actions">
              {/* Index keeps each button in place while its action changes, so focus stays on it. */}
              <Index each={buttons()}>
                {(b) => {
                  const face = () => connectionTestFace(b());
                  return (
                    <Button
                      label={b().label}
                      labelKey={b().labelKey}
                      glyph={face().outcome === "check" ? <IconCheck /> : face().outcome === "cross" ? <IconClose /> : b().glyph}
                      tone={face().tone}
                      busy={b().busy}
                      title={b().title}
                      disabled={b().disabled}
                      compactBelow={NARROW}
                      class={face().shake ? "glim-shake" : ""}
                      data-connection={b().id}
                      onClick={() => b().onClick()}
                    />
                  );
                }}
              </Index>
            </span>
          </Show>
        </div>
      </div>
    </div>
  );
}
