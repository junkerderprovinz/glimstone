<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { ChangeAnswer, FortressAnswer, FortressLabelKeys, FortressText, PhraseAnswer } from "@glimstone/core";

  export interface FortressPairingProps {
    text: FortressText;
    lang: string;
    app: { id: string; name: string };
    onLeave: () => Promise<FortressAnswer>;
    /** `password` is set where `phrasePassword` asks for it first. Without it there is no Show phrase here. */
    onShowPhrase?: (password?: string) => Promise<PhraseAnswer>;
    /** Asks for the app's password before the phrase shows. */
    phrasePassword?: boolean;
    /** What the QR code beside the words carries, the words alone without it. */
    phraseQr?: (words: string[]) => string;
    /** Without it there is no way to change the phrase here, for an app that cannot keep a new one. */
    onChangePhrase?: () => Promise<ChangeAnswer>;
    /** The devices whose pairing ends with leaving. */
    pairedWith?: string[];
    /** A sentence of the app's own for the leave window, such as what stays as it is. */
    leaveNote?: string;
    labelKeys?: Partial<FortressLabelKeys>;
    hueIndex?: number;
    /** Rows of the app's own above the phrase, such as the name the instance goes by. */
    children?: Snippet;
    /** Rows of the app's own below leaving, such as the switch for the other apps. */
    after?: Snippet;
  }
</script>

<script lang="ts">
  import { createFortressFlow, fill } from "@glimstone/core";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";
  import FieldRow from "./FieldRow.svelte";
  import FortressWindow from "./FortressWindow.svelte";
  import { LABEL_KEYS } from "./fortressParts.js";

  // The fortress in the app's pairing settings: the one place where the phrase
  // shows and changes and the app leaves, each behind a window that says what
  // it does. An app that shows the phrase here leaves Show phrase out of its
  // Fortress.
  let {
    text,
    lang,
    app,
    onLeave,
    onShowPhrase,
    phrasePassword,
    phraseQr,
    onChangePhrase,
    pairedWith,
    leaveNote,
    labelKeys,
    hueIndex,
    children,
    after,
  }: FortressPairingProps = $props();

  const flow = createFortressFlow(() => ({ onLeave, onShowPhrase, onChangePhrase, phrasePassword, failed: text.failed }));
  let s = $state.raw(flow.state());
  $effect(() => flow.subscribe(() => (s = flow.state())));
  const keys = $derived({ ...LABEL_KEYS, ...labelKeys });
</script>

<Card data-glim="FortressPairing" title={text.pairing} {hueIndex}>
  {@render children?.()}
  {#if onShowPhrase || onChangePhrase}
    <FieldRow label={text.phraseTitle} hint={onChangePhrase && text.changePhraseAbout}>
      {#if onShowPhrase}
        <Button label={text.showPhrase} labelKey={keys.showPhrase} busy={s.busy === "show"} onClick={() => void flow.openPhrase()} data-fortress="show" />
      {/if}
      {#if onChangePhrase}
        <Button label={text.change} labelKey={keys.changePhrase} onClick={flow.openChange} data-fortress="open-change" />
      {/if}
    </FieldRow>
  {/if}
  <FieldRow label={text.leaveRow} hint={fill(text.leaveAbout, { app: app.name })}>
    <Button label={text.leaveConfirm} labelKey={keys.leave} onClick={flow.openLeave} data-fortress="open-leave" />
  </FieldRow>
  {@render after?.()}
  {#if s.window}
    <FortressWindow {flow} flowState={s} {text} {lang} {app} {pairedWith} {leaveNote} {phraseQr} {keys} />
  {/if}
</Card>
