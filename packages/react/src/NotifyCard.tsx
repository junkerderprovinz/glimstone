import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  connectionTestFace,
  createNotifyCardFlow,
  fill,
  notifyChannelName,
  notifyForm,
  notifyGlyphKey,
  notifyPicker,
  notifyRemoval,
  notifyRows,
  showNotifyRefusal,
  NOTIFY_CARD_KEYS,
  NOTIFY_KINDS,
  NOTIFY_REDACTED,
  type Catalog,
  type NotifyApi,
  type NotifyCardFlow,
  type NotifyCardLabelKeys,
  type NotifyCardState,
  type NotifyCardText,
  type NotifyChoice,
  type NotifyField,
  type NotifyKind,
  type ToastSeverity,
} from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { Card } from "./Card.tsx";
import { Checkbox } from "./Checkbox.tsx";
import { EmptyState } from "./EmptyState.tsx";
import { FieldRow } from "./FieldRow.tsx";
import { FieldRowGroup } from "./FieldRowGroup.tsx";
import { GlyphTile } from "./GlyphTile.tsx";
import { glyphFor, IconCheck, IconClose, IconPencil, IconTrash } from "./glyphs.tsx";
import { ListRow } from "./ListRow.tsx";
import { NumberField } from "./NumberField.tsx";
import { PasswordField } from "./PasswordField.tsx";
import { PickerWindow } from "./PickerWindow.tsx";
import { BrandMark } from "./ReadmeButton.tsx";
import { Select } from "./Select.tsx";
import { Selector } from "./Selector.tsx";
import { TextArea, TextField } from "./TextField.tsx";
import { Toggle } from "./Toggle.tsx";
import { UnavailableNotice } from "./UnavailableNotice.tsx";
import { useConfirm } from "./useConfirm.tsx";
import { Window, type WindowAction } from "./Window.tsx";

export type { NotifyCardLabelKeys, NotifyCardText } from "@glimstone/core";

// The settings card "Notifications" ("The notification card" in the design
// language): the app's channels as rows, each with its switch, its test, Edit
// and Remove, and the catalog's picker to add one. The flow lives in the core
// and talks to the app through three calls, so the card names no app or route.

export interface NotifyCardProps {
  /** Loads, saves and tests the channels in the kit's notify format. */
  api: NotifyApi;
  /** The card's words, `notifyCardText(lang)` or the app's own. */
  text: NotifyCardText;
  /** The app's name, for the sentences that say it. */
  app: string;
  /** The interface language, which sorts the picker. */
  lang: string;
  /** The notification catalog, `NOTIFY_PROVIDERS`. */
  providers: Catalog;
  /** The kinds the app sends to, every kind of the kit by default. */
  kinds?: readonly NotifyKind[];
  /** The event kinds the app sends, which each channel can choose among. */
  events?: readonly NotifyChoice[];
  /** The keys a Healthchecks channel can give a check of their own, such as a job. */
  checks?: readonly NotifyChoice[];
  /** Kinds that send nothing where the app runs, with the sentence that says why. */
  unavailable?: Partial<Record<NotifyKind, string>>;
  /** Puts what a change did, or why it failed, into the app's toasts. */
  notify?: (message: string, severity: ToastSeverity) => void;
  /** The card's rainbow position. */
  hueIndex?: number;
  labelKeys?: Partial<NotifyCardLabelKeys>;
}

const NONE: readonly NotifyChoice[] = [];
const ANYWHERE: Partial<Record<NotifyKind, string>> = {};

export function NotifyCard(props: NotifyCardProps) {
  const { text, app, lang, providers, kinds = NOTIFY_KINDS, events = [], checks = [], unavailable = {}, hueIndex } = props;
  const latest = useRef(props);
  latest.current = props;
  const [flow] = useState(() =>
    createNotifyCardFlow(() => ({
      ...latest.current,
      kinds: latest.current.kinds ?? NOTIFY_KINDS,
      events: latest.current.events ?? NONE,
      checks: latest.current.checks ?? NONE,
      unavailable: latest.current.unavailable ?? ANYWHERE,
    })),
  );
  const s = useSyncExternalStore(flow.subscribe, flow.state, flow.state);
  useEffect(() => flow.start(), [flow]);
  useEffect(() => showNotifyRefusal(s.refusal), [s.refusal?.count]);
  const keys: NotifyCardLabelKeys = { ...NOTIFY_CARD_KEYS, ...props.labelKeys };
  const { confirm, confirmDialog } = useConfirm({ title: text.remove, cancel: text.cancel, confirm: text.remove });
  const mark = (kind: NotifyKind): ReactNode => {
    const m = providers.entries.find((e) => e.id === kind)?.mark;
    return m ? <BrandMark svg={m.svg} /> : glyphFor(notifyGlyphKey(kind, keys));
  };

  function ask(id: string) {
    const c = s.channels.find((x) => x.id === id);
    if (!c) return;
    const q = notifyRemoval(text, c);
    void confirm(q.message, { confirmLabel: q.confirm, confirmLabelKey: keys.remove }).then((yes) => {
      if (yes) void flow.remove(id);
    });
  }

  const rows = notifyRows(s, { text, providers, unavailable });
  return (
    <div data-glim="NotifyCard">
      <Card title={text.title} hint={text.hint} hueIndex={hueIndex}>
        <div className="glim-notify-body">
          {s.loadFailed && (
            <p className="glim-notify-said glim-notify-said--fail" role="alert">
              {text.notLoaded}
            </p>
          )}
          {rows.length > 0 ? (
            <div className="glim-list glim-notify-rows">
              {rows.map((row) => {
                const test = s.rowTests[row.id];
                const face = connectionTestFace(test);
                return (
                  <ListRow
                    key={row.id}
                    steady
                    name={row.name}
                    meta={row.meta}
                    tile={<GlyphTile glyph={mark(row.kind)} />}
                    badges={
                      row.idle ? (
                        <Badge size="small" tone="warn">
                          {text.idle}
                        </Badge>
                      ) : undefined
                    }
                    data-notify-channel={row.id}
                    actions={
                      <>
                        <Toggle checked={row.enabled} label={row.name} hideLabel onChange={(on) => void flow.setEnabled(row.id, on)} data-notify={`switch-${row.id}`} />
                        <Button
                          compact
                          tone={face.tone === "neutral" ? "subtle" : face.tone}
                          label={text.test}
                          labelKey={keys.test}
                          glyph={face.outcome === "cross" ? <IconClose /> : <IconCheck />}
                          busy={test?.busy}
                          title={test?.title}
                          className={face.shake ? "glim-shake" : undefined}
                          data-notify={`test-${row.id}`}
                          onClick={() => void flow.testRow(row.id)}
                        />
                        <Button compact tone="subtle" label={text.edit} labelKey={keys.edit} glyph={<IconPencil />} data-notify={`edit-${row.id}`} onClick={() => flow.edit(row.id)} />
                        <Button
                          compact
                          tone="subtle"
                          label={text.remove}
                          labelKey={keys.remove}
                          glyph={<IconTrash />}
                          busy={s.busy === `remove-${row.id}`}
                          data-notify={`remove-${row.id}`}
                          onClick={() => ask(row.id)}
                        />
                      </>
                    }
                  />
                );
              })}
            </div>
          ) : (
            s.loaded && <EmptyState nested title={fill(text.empty, { app })} />
          )}
          <div className="glim-notify-foot">
            <Button label={text.add} labelKey={keys.add} disabled={!s.loaded} data-notify="add" onClick={flow.pick} />
          </div>
        </div>
      </Card>
      <NotifyCardWindow s={s} flow={flow} text={text} app={app} lang={lang} providers={providers} kinds={kinds} events={events} checks={checks} unavailable={unavailable} keys={keys} mark={mark} />
      {confirmDialog}
    </div>
  );
}

interface WindowProps {
  s: NotifyCardState;
  flow: NotifyCardFlow;
  text: NotifyCardText;
  app: string;
  lang: string;
  providers: Catalog;
  kinds: readonly NotifyKind[];
  events: readonly NotifyChoice[];
  checks: readonly NotifyChoice[];
  unavailable: Partial<Record<NotifyKind, string>>;
  keys: NotifyCardLabelKeys;
  mark: (kind: NotifyKind) => ReactNode;
}

// The picker, and the form of the channel being added or edited.
function NotifyCardWindow({ s, flow, text, app, lang, providers, kinds, events, checks, unavailable, keys, mark }: WindowProps) {
  const w = s.window;
  if (!w) return null;
  const { items, groups } = notifyPicker(providers, text, lang, kinds, mark);
  const pickerText = { search: text.search, none: text.noMatch, clear: text.clear, close: text.close, cancel: text.cancel, back: text.back };
  if (w.kind === "pick") {
    return <PickerWindow title={text.add} hint={text.hint} items={items} groups={groups} text={pickerText} onPick={flow.choose} onClose={flow.close} />;
  }
  const form = notifyForm(s, { text, app, events, checks, unavailable });
  if (!form || !s.draft) return null;
  const test = s.formTest;
  const face = connectionTestFace(test);
  const actions: WindowAction[] = [
    {
      label: text.test,
      labelKey: keys.test,
      glyph: face.outcome === "cross" ? <IconClose /> : face.outcome === "check" ? <IconCheck /> : undefined,
      tone: test?.busy ? undefined : test?.tone,
      busy: !!test?.busy,
      title: test?.title,
      attrs: { "data-notify": "form-test" },
      onClick: () => {
        void flow.test();
        return false;
      },
    },
    {
      label: text.save,
      labelKey: keys.save,
      primary: true,
      busy: s.busy === "save",
      attrs: { "data-notify": "save" },
      onClick: () => {
        void flow.save();
        return false;
      },
    },
  ];
  const body = <NotifyForm form={form} s={s} flow={flow} text={text} keys={keys} />;
  if (w.adding) {
    return (
      <PickerWindow title={text.add} items={items} groups={groups} text={pickerText} selected={form.kind} actions={actions} onPick={flow.choose} onBack={flow.pick} onClose={flow.close}>
        {body}
      </PickerWindow>
    );
  }
  return (
    <Window title={fill(text.editTitle, { name: notifyChannelName(text, s.draft) })} text={{ cancel: text.cancel, close: text.close }} closeOnBackdrop={false} actions={actions} onClose={flow.close}>
      {body}
    </Window>
  );
}

function NotifyForm({ form, s, flow, text, keys }: { form: NonNullable<ReturnType<typeof notifyForm>>; s: NotifyCardState; flow: NotifyCardFlow; text: NotifyCardText; keys: NotifyCardLabelKeys }) {
  const eye = { show: text.show, hide: text.hide };
  const problem = (f: NotifyField) =>
    f.error && (
      <p className="glim-notify-problem" role="alert">
        {f.error}
      </p>
    );
  const control = (f: NotifyField) => {
    switch (f.control) {
      case "secret":
        return <PasswordField autoComplete="new-password" value={f.value} text={eye} note={f.note} error={f.error} onChange={(e) => flow.set(f.path, e.target.value)} />;
      case "number":
        return <NumberField min={1} max={65535} value={f.value} placeholder={f.placeholder} error={f.error} onChange={(e) => flow.set(f.path, e.target.value)} />;
      case "area":
        return <TextArea mono={f.mono} value={f.value} placeholder={f.placeholder} error={f.error} onChange={(e) => flow.set(f.path, e.target.value)} />;
      case "select":
        return (
          <>
            <Select value={f.value} options={(f.options ?? []).map((o) => ({ value: o.value, label: o.label }))} onChange={(v) => flow.set(f.path, v)} />
            {problem(f)}
          </>
        );
      case "segments":
        return (
          <>
            <Selector inline activation="manual" value={f.value} items={(f.options ?? []).map((o) => ({ id: o.value, label: o.label }))} onChange={(v) => flow.set(f.path, v)} />
            {problem(f)}
          </>
        );
      case "checks":
        return (
          <div className="glim-notify-checks" data-notify="events">
            {(f.options ?? []).map((o) => (
              <Checkbox key={o.value} checked={!!o.checked} label={o.label} onChange={(on) => flow.setEvent(o.value, on)} />
            ))}
          </div>
        );
      case "headers":
        return (
          <div className="glim-notify-headers">
            {s.headers.map((h, i) => (
              <div key={i} className="glim-notify-header">
                <TextField mono label={text.fields.headerName} value={h.name} placeholder="Authorization" onChange={(e) => flow.setHeader(i, "name", e.target.value)} />
                <PasswordField
                  autoComplete="new-password"
                  aria-label={text.fields.headerValue}
                  value={h.value === NOTIFY_REDACTED ? "" : h.value}
                  text={eye}
                  onChange={(e) => flow.setHeader(i, "value", e.target.value)}
                />
                <Button compact tone="subtle" label={text.fields.headerRemove} labelKey={keys.remove} glyph={<IconTrash />} onClick={() => flow.removeHeader(i)} />
              </div>
            ))}
            <div>
              <Button label={text.fields.headerAdd} labelKey={keys.add} onClick={flow.addHeader} />
            </div>
            {f.note && <p className="glim-notify-text">{f.note}</p>}
            {problem(f)}
          </div>
        );
      default:
        return <TextField mono={f.mono} value={f.value} placeholder={f.placeholder} error={f.error} onChange={(e) => flow.set(f.path, e.target.value)} />;
    }
  };
  return (
    <div className="glim-notify-form" data-notify-form={form.kind}>
      {form.hint && <p className="glim-notify-text">{form.hint}</p>}
      {form.unavailable && <UnavailableNotice title={text.idle} reason={form.unavailable} />}
      {form.loose.map((line, i) => (
        <p key={i} className="glim-notify-problem" role="alert">
          {line}
        </p>
      ))}
      <FieldRowGroup>
        {form.fields.map((f) => (
          <FieldRow key={f.path} label={f.label} hint={f.hint}>
            {control(f)}
          </FieldRow>
        ))}
      </FieldRowGroup>
      {s.said && (
        <p className={s.said.ok ? "glim-notify-said" : "glim-notify-said glim-notify-said--fail"} role={s.said.ok ? "status" : "alert"}>
          {s.said.message}
        </p>
      )}
    </div>
  );
}
