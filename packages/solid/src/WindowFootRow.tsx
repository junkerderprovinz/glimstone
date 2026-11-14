import { children, createMemo, For, Show, type JSX } from "solid-js";
import { windowFoot } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconCancel, IconClose } from "./glyphs.tsx";

// The foot of a Window or a Sheet: a quiet start line and the actions at the
// end, with Cancel or Close added by windowFoot() in the core.

export interface WindowAction {
  label: string;
  /** The translation key behind `label`, which picks the glyph, or `null`. */
  labelKey: string | null;
  glyph?: JSX.Element;
  /** The forward action, filled with the accent and placed last. */
  primary?: boolean;
  /** This action already leaves the window, so no Cancel or Close is added. */
  wayOut?: boolean;
  disabled?: boolean;
  /** Attributes for the action's button, such as a data hook. */
  attrs?: Record<string, string>;
  /** Runs on press. The window closes afterwards unless it returns false. */
  onClick?: () => void | false;
}

export function WindowFootRow(props: {
  actions: WindowAction[];
  start?: JSX.Element;
  text: { cancel: string; close: string };
  onClose: () => void;
}) {
  const start = children(() => props.start);
  const foot = createMemo(() =>
    windowFoot<WindowAction>(props.actions, start() !== undefined, {
      cancel: { label: props.text.cancel, labelKey: "common.cancel", glyph: <IconCancel />, wayOut: true },
      close: { label: props.text.close, labelKey: "common.close", glyph: <IconClose />, wayOut: true },
    }),
  );
  return (
    <Show when={foot().length > 0}>
      <div class="glim-modal-foot">
        <Show when={start() !== undefined}>
          <span class="glim-window-start">{start()}</span>
        </Show>
        <For each={foot()}>
          {(a) => (
            <Button
              {...a.attrs}
              label={a.label}
              labelKey={a.labelKey}
              glyph={a.glyph}
              tone={a.primary ? "accent" : "neutral"}
              disabled={a.disabled}
              onClick={() => {
                if (a.onClick?.() !== false) props.onClose();
              }}
            />
          )}
        </For>
      </div>
    </Show>
  );
}
