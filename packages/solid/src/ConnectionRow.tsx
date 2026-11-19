import { children, createMemo, Show, splitProps, type JSX } from "solid-js";
import { CONNECTION_ROW_KEYS, connectionTestFace, connectionTile, type ConnectionRowLabelKeys, type ConnectionRowText, type ConnectionTest, type TileMark } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { BrandMark } from "./ReadmeButton.tsx";
import { IconCheck, IconClose } from "./glyphs.tsx";
import { css } from "./style.ts";

export type { ConnectionRowLabelKeys, ConnectionRowText, ConnectionTest } from "@glimstone/core";

// A connected service or account as a compact row ("Connections" in the design
// language): its mark lit on a tile the row's whole height, its name with any
// badges, one quiet line on how it stands, and its test, edit and remove at
// the end. A button stands only where its handler is passed. The other props
// of a <div> go to the row.

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
  const [own, rest] = splitProps(props, ["name", "mark", "status", "badges", "children", "test", "text", "labelKeys", "onTest", "onEdit", "onRemove", "class"]);
  const keys = () => ({ ...CONNECTION_ROW_KEYS, ...own.labelKeys });
  // A glyph is drawn anew on every read, so the mark is read once.
  const mark = createMemo(() => own.mark);
  const tile = () => connectionTile(mark());
  const face = () => connectionTestFace(own.test);
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
          <Show when={own.onTest || own.onEdit || own.onRemove}>
            <span class="glim-connection-actions">
              <Show when={own.onTest}>
                <Button
                  label={own.text.test}
                  labelKey={keys().test}
                  glyph={face().outcome === "check" ? <IconCheck /> : face().outcome === "cross" ? <IconClose /> : undefined}
                  tone={face().tone}
                  busy={own.test?.busy}
                  title={own.test?.title}
                  compactBelow={NARROW}
                  class={face().shake ? "glim-shake" : ""}
                  data-connection="test"
                  onClick={() => own.onTest?.()}
                />
              </Show>
              <Show when={own.onEdit}>
                <Button label={own.text.edit} labelKey={keys().edit} compactBelow={NARROW} data-connection="edit" onClick={() => own.onEdit?.()} />
              </Show>
              <Show when={own.onRemove}>
                <Button label={own.text.remove} labelKey={keys().remove} compactBelow={NARROW} data-connection="remove" onClick={() => own.onRemove?.()} />
              </Show>
            </span>
          </Show>
        </div>
      </div>
    </div>
  );
}
