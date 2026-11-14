import { createMemo, For, Show, type JSX } from "solid-js";
import { statusView, type FortressApp, type FortressInstance, type FortressLogLine, type FortressStatusReport, type FortressText } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { BusyRing } from "./BusyRing.tsx";
import { ProgressBar } from "./ProgressBar.tsx";
import { Window } from "./Window.tsx";
import { glyphFor, IconClose } from "./glyphs.tsx";

export type { FortressLogLine, FortressStatusReport } from "@glimstone/core";

export interface FortressStatusWindowProps {
  app: FortressApp;
  instance: FortressInstance;
  /** The member's status report, its words and times already in the person's language. */
  report?: FortressStatusReport;
  /** The member's log, newest first. The window shows the first ten lines. */
  log?: FortressLogLine[];
  loading?: boolean;
  /** Why the report did not come, such as `openRefusalText` puts it. */
  error?: string;
  text: FortressText;
  /** The interface language. */
  lang: string;
  onClose: () => void;
}

function Section<T>(props: { name: string; title: string; items: T[]; children: (item: T) => JSX.Element }) {
  return (
    <Show when={props.items.length > 0}>
      <section class="glim-status-section" data-fortress={props.name}>
        <h3 class="glim-status-heading">{props.title}</h3>
        <ul class="glim-status-list">
          <For each={props.items}>{props.children}</For>
        </ul>
      </section>
    </Show>
  );
}

/**
 * What Open shows for a member without pages of its own, such as an Unraid
 * plugin, whose pages need Unraid's own sign-in and so never go through the
 * fortress: its state from the status report, its last log lines and, for a
 * plugin, where its settings are.
 */
export function FortressStatusWindow(props: FortressStatusWindowProps) {
  const view = createMemo(() =>
    statusView({ app: props.app, instance: props.instance, report: props.report, log: props.log, loading: props.loading, error: props.error, text: props.text }),
  );
  return (
    <Window
      data-glim="FortressStatusWindow"
      lang={props.lang}
      title={view().title}
      drawn={
        <span class="glim-status-title">
          <Show when={props.app.logo}>
            <img src={props.app.logo} alt="" />
          </Show>
          {view().title}
        </span>
      }
      text={{ cancel: props.text.cancel, close: props.text.close }}
      onClose={props.onClose}
      actions={[{ label: props.text.close, labelKey: "common.close", glyph: <IconClose />, wayOut: true }]}
    >
      <div class="glim-fortress-text" data-fortress="status">
        <Show when={view().loading}>
          <p class="glim-fortress-note" data-fortress="loading">
            <BusyRing size="small" delay={0} />
            <span role="status">{view().loading}</span>
          </p>
        </Show>
        <Show when={view().error !== undefined}>
          <p class="glim-fortress-note" role="status" data-fortress="error">
            {glyphFor("info")}
            <span>{view().error}</span>
          </p>
        </Show>
        <Show when={view().state}>
          {(state) => (
            <p class="glim-status-state" data-fortress="state">
              <Badge tone={state().tone}>{state().label}</Badge>
              <Show when={view().quiet}>
                <span class="glim-fortress-sub">{view().quiet}</span>
              </Show>
            </p>
          )}
        </Show>
        <Section name="needs" title={props.text.statusNeedsYou} items={view().needsYou}>
          {(n) => (
            <li class="glim-status-line">
              <Show when={n.level}>{(level) => <Badge tone={level().tone}>{level().label}</Badge>}</Show>{" "}
              <span>{n.text}</span>
            </li>
          )}
        </Section>
        <Section name="work" title={props.text.statusWork} items={view().work}>
          {(w) => (
            <li class="glim-status-work">
              <span>{w.title}</span>
              <ProgressBar value={w.progress} label={w.title} />
            </li>
          )}
        </Section>
        <Section name="next" title={props.text.statusNext} items={view().next}>
          {(n) => (
            <li class="glim-status-line">
              <span>{n.title}</span>{" "}
              <span class="glim-status-at glim-num">{n.at}</span>
            </li>
          )}
        </Section>
        <Section name="log" title={props.text.statusLog} items={view().log}>
          {(l) => (
            <li class="glim-status-line">
              <span class="glim-status-at glim-num">{l.at}</span>{" "}
              <Show when={l.level}>{(level) => <Badge tone={level().tone}>{level().label}</Badge>}</Show>{" "}
              <span>{l.text}</span>
            </li>
          )}
        </Section>
        <Show when={view().where}>
          <p class="glim-fortress-sub" data-fortress="where">
            {view().where}
          </p>
        </Show>
      </div>
    </Window>
  );
}
