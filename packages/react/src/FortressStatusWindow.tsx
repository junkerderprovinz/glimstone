import type { ReactNode } from "react";
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

/**
 * What Open shows for a member without pages of its own, such as an Unraid
 * plugin, whose pages need Unraid's own sign-in and so never go through the
 * fortress: its state from the status report, its last log lines and, for a
 * plugin, where its settings are.
 */
export function FortressStatusWindow({ app, instance, report, log, loading, error, text, lang, onClose }: FortressStatusWindowProps) {
  const view = statusView({ app, instance, report, log, loading, error, text });
  const section = (name: string, title: string, items: ReactNode[]) =>
    items.length > 0 && (
      <section className="glim-status-section" data-fortress={name}>
        <h3 className="glim-status-heading">{title}</h3>
        <ul className="glim-status-list">{items}</ul>
      </section>
    );
  return (
    <Window
      data-glim="FortressStatusWindow"
      lang={lang}
      title={view.title}
      drawn={
        <span className="glim-status-title">
          {app.logo && <img src={app.logo} alt="" />}
          {view.title}
        </span>
      }
      text={{ cancel: text.cancel, close: text.close }}
      onClose={onClose}
      actions={[{ label: text.close, labelKey: "common.close", glyph: <IconClose />, wayOut: true }]}
    >
      <div className="glim-fortress-text" data-fortress="status">
        {view.loading && (
          <p className="glim-fortress-note" data-fortress="loading">
            <BusyRing size="small" delay={0} />
            <span role="status">{view.loading}</span>
          </p>
        )}
        {view.error !== undefined && (
          <p className="glim-fortress-note" role="status" data-fortress="error">
            {glyphFor("info")}
            <span>{view.error}</span>
          </p>
        )}
        {view.state && (
          <p className="glim-status-state" data-fortress="state">
            <Badge tone={view.state.tone}>{view.state.label}</Badge>
            {view.quiet && <span className="glim-fortress-sub">{view.quiet}</span>}
          </p>
        )}
        {section(
          "needs",
          text.statusNeedsYou,
          view.needsYou.map((n, i) => (
            <li key={i} className="glim-status-line">
              {n.level && <Badge tone={n.level.tone}>{n.level.label}</Badge>}
              <span>{n.text}</span>
            </li>
          )),
        )}
        {section(
          "work",
          text.statusWork,
          view.work.map((w, i) => (
            <li key={i} className="glim-status-work">
              <span>{w.title}</span>
              <ProgressBar value={w.progress} label={w.title} />
            </li>
          )),
        )}
        {section(
          "next",
          text.statusNext,
          view.next.map((n, i) => (
            <li key={i} className="glim-status-line">
              <span>{n.title}</span>
              <span className="glim-status-at glim-num">{n.at}</span>
            </li>
          )),
        )}
        {section(
          "log",
          text.statusLog,
          view.log.map((l, i) => (
            <li key={i} className="glim-status-line">
              <span className="glim-status-at glim-num">{l.at}</span>
              {l.level && <Badge tone={l.level.tone}>{l.level.label}</Badge>}
              <span>{l.text}</span>
            </li>
          )),
        )}
        {view.where && (
          <p className="glim-fortress-sub" data-fortress="where">
            {view.where}
          </p>
        )}
      </div>
    </Window>
  );
}
