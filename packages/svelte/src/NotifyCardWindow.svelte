<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    connectionTestFace,
    fill,
    notifyChannelName,
    notifyForm,
    notifyPicker,
    NOTIFY_REDACTED,
    type Catalog,
    type NotifyCardFlow,
    type NotifyCardLabelKeys,
    type NotifyCardState,
    type NotifyCardText,
    type NotifyChoice,
    type NotifyField,
    type NotifyKind,
  } from "@glimstone/core";
  import Button from "./Button.svelte";
  import Checkbox from "./Checkbox.svelte";
  import FieldRow from "./FieldRow.svelte";
  import FieldRowGroup from "./FieldRowGroup.svelte";
  import NumberField from "./NumberField.svelte";
  import PasswordField from "./PasswordField.svelte";
  import PickerWindow from "./PickerWindow.svelte";
  import Select from "./Select.svelte";
  import Selector from "./Selector.svelte";
  import TextArea from "./TextArea.svelte";
  import TextField from "./TextField.svelte";
  import UnavailableNotice from "./UnavailableNotice.svelte";
  import Window, { type WindowAction } from "./Window.svelte";
  import { IconCheck, IconClose, IconTrash } from "./glyphs.js";

  // The notification card's window: the picker, and the form of the channel
  // being added or edited.
  let {
    flow,
    flowState: s,
    text,
    app,
    lang,
    providers,
    kinds,
    events,
    checks,
    unavailable,
    keys,
    glyph,
  }: {
    flow: NotifyCardFlow;
    flowState: NotifyCardState;
    text: NotifyCardText;
    app: string;
    lang: string;
    providers: Catalog;
    kinds: readonly NotifyKind[];
    events: readonly NotifyChoice[];
    checks: readonly NotifyChoice[];
    unavailable: Partial<Record<NotifyKind, string>>;
    keys: NotifyCardLabelKeys;
    glyph: (kind: NotifyKind) => Snippet;
  } = $props();

  const w = $derived(s.window!);
  const picker = $derived(notifyPicker(providers, text, lang, kinds, glyph));
  const pickerText = $derived({ search: text.search, none: text.noMatch, clear: text.clear, close: text.close, cancel: text.cancel, back: text.back });
  const form = $derived(w.kind === "form" ? notifyForm(s, { text, app, events, checks, unavailable }) : null);
  const eye = $derived({ show: text.show, hide: text.hide });
  const title = $derived(s.draft ? fill(text.editTitle, { name: notifyChannelName(text, s.draft) }) : "");
  const actions = $derived.by<WindowAction[]>(() => {
    const test = s.formTest;
    const face = connectionTestFace(test);
    return [
      {
        label: text.test,
        labelKey: keys.test,
        glyph: face.outcome === "cross" ? IconClose : face.outcome === "check" ? IconCheck : undefined,
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
  });
  const items = (options: NotifyField["options"]) => (options ?? []).map((o) => ({ id: o.value, label: o.label }));
  const port = (v: string) => (v === "" ? null : Number(v));
</script>

{#snippet problem(f: NotifyField)}
  {#if f.error}
    <p class="glim-notify-problem" role="alert">{f.error}</p>
  {/if}
{/snippet}

{#snippet body()}
  {#if form}
    <div class="glim-notify-form" data-notify-form={form.kind}>
      {#if form.hint}
        <p class="glim-notify-text">{form.hint}</p>
      {/if}
      {#if form.unavailable}
        <UnavailableNotice title={text.idle} reason={form.unavailable} />
      {/if}
      {#each form.loose as line, i (i)}
        <p class="glim-notify-problem" role="alert">{line}</p>
      {/each}
      <FieldRowGroup>
        {#each form.fields as f (f.path)}
          <FieldRow label={f.label} hint={f.hint}>
            {#if f.control === "secret"}
              <PasswordField autocomplete="new-password" value={f.value} text={eye} note={f.note} error={f.error} oninput={(e) => flow.set(f.path, e.currentTarget.value)} />
            {:else if f.control === "number"}
              <NumberField
                min={1}
                max={65535}
                value={port(f.value)}
                placeholder={f.placeholder}
                error={f.error}
                onChange={(e) => flow.set(f.path, e.currentTarget.value)}
              />
            {:else if f.control === "area"}
              <TextArea mono={f.mono} value={f.value} placeholder={f.placeholder} error={f.error} oninput={(e) => flow.set(f.path, e.currentTarget.value)} />
            {:else if f.control === "select"}
              <Select value={f.value} options={(f.options ?? []).map((o) => ({ value: o.value, label: o.label }))} onChange={(v) => flow.set(f.path, v)} />
              {@render problem(f)}
            {:else if f.control === "segments"}
              <Selector inline activation="manual" value={f.value} items={items(f.options)} onChange={(v) => flow.set(f.path, v)} />
              {@render problem(f)}
            {:else if f.control === "checks"}
              <div class="glim-notify-checks" data-notify="events">
                {#each f.options ?? [] as o (o.value)}
                  <Checkbox bind:checked={() => !!o.checked, (on) => flow.setEvent(o.value, on)} label={o.label} />
                {/each}
              </div>
            {:else if f.control === "headers"}
              <div class="glim-notify-headers">
                {#each s.headers as h, i (i)}
                  <div class="glim-notify-header">
                    <TextField mono label={text.fields.headerName} value={h.name} placeholder="Authorization" oninput={(e) => flow.setHeader(i, "name", e.currentTarget.value)} />
                    <PasswordField
                      autocomplete="new-password"
                      aria-label={text.fields.headerValue}
                      value={h.value === NOTIFY_REDACTED ? "" : h.value}
                      text={eye}
                      oninput={(e) => flow.setHeader(i, "value", e.currentTarget.value)}
                    />
                    <Button compact tone="subtle" label={text.fields.headerRemove} labelKey={keys.remove} glyph={IconTrash} onClick={() => flow.removeHeader(i)} />
                  </div>
                {/each}
                <div>
                  <Button label={text.fields.headerAdd} labelKey={keys.add} onClick={flow.addHeader} />
                </div>
                {#if f.note}
                  <p class="glim-notify-text">{f.note}</p>
                {/if}
                {@render problem(f)}
              </div>
            {:else}
              <TextField mono={f.mono} value={f.value} placeholder={f.placeholder} error={f.error} oninput={(e) => flow.set(f.path, e.currentTarget.value)} />
            {/if}
          </FieldRow>
        {/each}
      </FieldRowGroup>
      {#if s.said}
        <p class={s.said.ok ? "glim-notify-said" : "glim-notify-said glim-notify-said--fail"} role={s.said.ok ? "status" : "alert"}>{s.said.message}</p>
      {/if}
    </div>
  {/if}
{/snippet}

{#if w.kind === "pick"}
  <PickerWindow title={text.add} hint={text.hint} items={picker.items} groups={picker.groups} text={pickerText} onPick={flow.choose} onClose={flow.close} />
{:else if form && w.adding}
  <PickerWindow
    title={text.add}
    items={picker.items}
    groups={picker.groups}
    text={pickerText}
    selected={form.kind}
    {actions}
    onPick={flow.choose}
    onBack={flow.pick}
    onClose={flow.close}
  >
    {@render body()}
  </PickerWindow>
{:else if form}
  <Window {title} text={{ cancel: text.cancel, close: text.close }} closeOnBackdrop={false} {actions} onClose={flow.close}>
    {@render body()}
  </Window>
{/if}
