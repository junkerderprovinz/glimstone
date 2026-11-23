import { createEffect, createMemo, createSignal, Index, Match, mergeProps, on, onCleanup, onMount, Show, Switch, type Accessor, type JSX } from "solid-js";
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
  type NotifyCardOptions,
  type NotifyCardState,
  type NotifyCardText,
  type NotifyChoice,
  type NotifyField,
  type NotifyForm,
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

type Own = NotifyCardProps & Pick<NotifyCardOptions, "kinds" | "events" | "checks" | "unavailable">;

interface Ctx {
  s: Accessor<NotifyCardState>;
  flow: NotifyCardFlow;
  own: Own;
  keys: Accessor<NotifyCardLabelKeys>;
  mark: (kind: NotifyKind) => JSX.Element;
}

export function NotifyCard(props: NotifyCardProps) {
  const own: Own = mergeProps({ kinds: NOTIFY_KINDS, events: [], checks: [], unavailable: {} } as Pick<NotifyCardOptions, "kinds" | "events" | "checks" | "unavailable">, props);
  const flow = createNotifyCardFlow(() => own);
  const [s, setS] = createSignal(flow.state());
  onCleanup(flow.subscribe(() => setS(flow.state())));
  onMount(() => onCleanup(flow.start()));
  createEffect(on(() => s().refusal?.count, () => onCleanup(showNotifyRefusal(s().refusal))));
  const keys = createMemo<NotifyCardLabelKeys>(() => ({ ...NOTIFY_CARD_KEYS, ...own.labelKeys }));
  const { confirm, confirmDialog } = useConfirm({ title: own.text.remove, cancel: own.text.cancel, confirm: own.text.remove });
  const mark = (kind: NotifyKind): JSX.Element => {
    const m = own.providers.entries.find((e) => e.id === kind)?.mark;
    return m ? <BrandMark svg={m.svg} /> : glyphFor(notifyGlyphKey(kind, keys()));
  };
  const ctx: Ctx = { s, flow, own, keys, mark };

  function ask(id: string) {
    const c = s().channels.find((x) => x.id === id);
    if (!c) return;
    const q = notifyRemoval(own.text, c);
    void confirm(q.message, { confirmLabel: q.confirm, confirmLabelKey: keys().remove }).then((yes) => {
      if (yes) void flow.remove(id);
    });
  }

  const rows = createMemo(() => notifyRows(s(), own));
  return (
    <div data-glim="NotifyCard">
      <Card title={own.text.title} hint={own.text.hint} hueIndex={own.hueIndex}>
        <div class="glim-notify-body">
          <Show when={s().loadFailed}>
            <p class="glim-notify-said glim-notify-said--fail" role="alert">
              {own.text.notLoaded}
            </p>
          </Show>
          <Show when={rows().length > 0} fallback={<Show when={s().loaded}>{<EmptyState nested title={fill(own.text.empty, { app: own.app })} />}</Show>}>
            <div class="glim-list glim-notify-rows">
              <Index each={rows()}>
                {(r) => {
                  const test = () => s().rowTests[r().id];
                  const face = () => connectionTestFace(test());
                  return (
                    <ListRow
                      steady
                      name={r().name}
                      meta={r().meta}
                      tile={<GlyphTile glyph={mark(r().kind)} />}
                      badges={
                        r().idle ? (
                          <Badge size="small" tone="warn">
                            {own.text.idle}
                          </Badge>
                        ) : undefined
                      }
                      data-notify-channel={r().id}
                      actions={
                        <>
                          <Toggle checked={r().enabled} label={r().name} hideLabel onChange={(on) => void flow.setEnabled(r().id, on)} data-notify={`switch-${r().id}`} />
                          <Button
                            compact
                            tone={face().tone === "neutral" ? "subtle" : face().tone}
                            label={own.text.test}
                            labelKey={keys().test}
                            glyph={face().outcome === "cross" ? <IconClose /> : <IconCheck />}
                            busy={test()?.busy}
                            title={test()?.title}
                            class={face().shake ? "glim-shake" : undefined}
                            data-notify={`test-${r().id}`}
                            onClick={() => void flow.testRow(r().id)}
                          />
                          <Button compact tone="subtle" label={own.text.edit} labelKey={keys().edit} glyph={<IconPencil />} data-notify={`edit-${r().id}`} onClick={() => flow.edit(r().id)} />
                          <Button
                            compact
                            tone="subtle"
                            label={own.text.remove}
                            labelKey={keys().remove}
                            glyph={<IconTrash />}
                            busy={s().busy === `remove-${r().id}`}
                            data-notify={`remove-${r().id}`}
                            onClick={() => ask(r().id)}
                          />
                        </>
                      }
                    />
                  );
                }}
              </Index>
            </div>
          </Show>
          <div class="glim-notify-foot">
            <Button label={own.text.add} labelKey={keys().add} disabled={!s().loaded} data-notify="add" onClick={flow.pick} />
          </div>
        </div>
      </Card>
      <NotifyCardWindow ctx={ctx} />
      {confirmDialog}
    </div>
  );
}

// The picker, and the form of the channel being added or edited.
function NotifyCardWindow(props: { ctx: Ctx }) {
  const { s, flow, own, keys, mark } = props.ctx;
  const picker = createMemo(() => notifyPicker(own.providers, own.text, own.lang, own.kinds, mark));
  const pickerText = () => ({ search: own.text.search, none: own.text.noMatch, clear: own.text.clear, close: own.text.close, cancel: own.text.cancel, back: own.text.back });
  const form = () => (s().window?.kind === "form" ? notifyForm(s(), own) : null);
  const actions = (): WindowAction[] => {
    const test = s().formTest;
    const face = connectionTestFace(test);
    return [
      {
        label: own.text.test,
        labelKey: keys().test,
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
        label: own.text.save,
        labelKey: keys().save,
        primary: true,
        busy: s().busy === "save",
        attrs: { "data-notify": "save" },
        onClick: () => {
          void flow.save();
          return false;
        },
      },
    ];
  };
  const adding = () => {
    const w = s().window;
    return w?.kind === "form" && w.adding;
  };
  const title = () => {
    const d = s().draft;
    return d ? fill(own.text.editTitle, { name: notifyChannelName(own.text, d) }) : "";
  };
  return (
    <Switch>
      <Match when={s().window?.kind === "pick"}>
        <PickerWindow title={own.text.add} hint={own.text.hint} items={picker().items} groups={picker().groups} text={pickerText()} onPick={flow.choose} onClose={flow.close} />
      </Match>
      <Match when={adding() && form()}>
        {(f) => (
          <PickerWindow
            title={own.text.add}
            items={picker().items}
            groups={picker().groups}
            text={pickerText()}
            selected={f().kind}
            actions={actions()}
            onPick={flow.choose}
            onBack={flow.pick}
            onClose={flow.close}
          >
            <NotifyFormBody form={f} ctx={props.ctx} />
          </PickerWindow>
        )}
      </Match>
      <Match when={form()}>
        {(f) => (
          <Window title={title()} text={{ cancel: own.text.cancel, close: own.text.close }} closeOnBackdrop={false} actions={actions()} onClose={flow.close}>
            <NotifyFormBody form={f} ctx={props.ctx} />
          </Window>
        )}
      </Match>
    </Switch>
  );
}

function NotifyFormBody(props: { form: Accessor<NotifyForm>; ctx: Ctx }) {
  const { s, flow, own, keys } = props.ctx;
  const eye = () => ({ show: own.text.show, hide: own.text.hide });
  const problem = (f: Accessor<NotifyField>) => (
    <Show when={f().error}>
      <p class="glim-notify-problem" role="alert">
        {f().error}
      </p>
    </Show>
  );
  const control = (f: Accessor<NotifyField>) => (
    <Switch fallback={<TextField mono={f().mono} value={f().value} placeholder={f().placeholder} error={f().error} onInput={(e) => flow.set(f().path, e.currentTarget.value)} />}>
      <Match when={f().control === "secret"}>
        <PasswordField autocomplete="new-password" value={f().value} text={eye()} note={f().note} error={f().error} onInput={(e) => flow.set(f().path, e.currentTarget.value)} />
      </Match>
      <Match when={f().control === "number"}>
        <NumberField min={1} max={65535} value={f().value} placeholder={f().placeholder} error={f().error} onChange={(e) => flow.set(f().path, e.currentTarget.value)} />
      </Match>
      <Match when={f().control === "area"}>
        <TextArea mono={f().mono} value={f().value} placeholder={f().placeholder} error={f().error} onInput={(e) => flow.set(f().path, e.currentTarget.value)} />
      </Match>
      <Match when={f().control === "select"}>
        <Select value={f().value} options={(f().options ?? []).map((o) => ({ value: o.value, label: o.label }))} onChange={(v) => flow.set(f().path, v)} />
        {problem(f)}
      </Match>
      <Match when={f().control === "segments"}>
        <Selector inline activation="manual" value={f().value} items={(f().options ?? []).map((o) => ({ id: o.value, label: o.label }))} onChange={(v) => flow.set(f().path, v)} />
        {problem(f)}
      </Match>
      <Match when={f().control === "checks"}>
        <div class="glim-notify-checks" data-notify="events">
          <Index each={f().options ?? []}>{(o) => <Checkbox checked={!!o().checked} label={o().label} onChange={(on) => flow.setEvent(o().value, on)} />}</Index>
        </div>
      </Match>
      <Match when={f().control === "headers"}>
        <div class="glim-notify-headers">
          <Index each={s().headers}>
            {(h, i) => (
              <div class="glim-notify-header">
                <TextField mono label={own.text.fields.headerName} value={h().name} placeholder="Authorization" onInput={(e) => flow.setHeader(i, "name", e.currentTarget.value)} />
                <PasswordField
                  autocomplete="new-password"
                  aria-label={own.text.fields.headerValue}
                  value={h().value === NOTIFY_REDACTED ? "" : h().value}
                  text={eye()}
                  onInput={(e) => flow.setHeader(i, "value", e.currentTarget.value)}
                />
                <Button compact tone="subtle" label={own.text.fields.headerRemove} labelKey={keys().remove} glyph={<IconTrash />} onClick={() => flow.removeHeader(i)} />
              </div>
            )}
          </Index>
          <div>
            <Button label={own.text.fields.headerAdd} labelKey={keys().add} onClick={flow.addHeader} />
          </div>
          <Show when={f().note}>
            <p class="glim-notify-text">{f().note}</p>
          </Show>
          {problem(f)}
        </div>
      </Match>
    </Switch>
  );
  return (
    <div class="glim-notify-form" data-notify-form={props.form().kind}>
      <Show when={props.form().hint}>
        <p class="glim-notify-text">{props.form().hint}</p>
      </Show>
      <Show when={props.form().unavailable}>{(why) => <UnavailableNotice title={own.text.idle} reason={why()} />}</Show>
      <Index each={props.form().loose}>
        {(line) => (
          <p class="glim-notify-problem" role="alert">
            {line()}
          </p>
        )}
      </Index>
      <FieldRowGroup>
        <Index each={props.form().fields}>
          {(f) => (
            <FieldRow label={f().label} hint={f().hint}>
              {control(f)}
            </FieldRow>
          )}
        </Index>
      </FieldRowGroup>
      <Show when={s().said}>
        {(said) => (
          <p class={said().ok ? "glim-notify-said" : "glim-notify-said glim-notify-said--fail"} role={said().ok ? "status" : "alert"}>
            {said().message}
          </p>
        )}
      </Show>
    </div>
  );
}
