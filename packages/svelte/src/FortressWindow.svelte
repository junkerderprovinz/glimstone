<script lang="ts">
  import { untrack } from "svelte";
  import {
    COPIED_MS,
    copyText,
    fill,
    listOf,
    MARKS,
    phraseReady,
    qrCode,
    shake,
    windowFocusTarget,
    type FortressFlow,
    type FortressLabelKeys,
    type FortressState,
    type FortressText,
    type WindowSize,
  } from "@glimstone/core";
  import MarkSvg from "./MarkSvg.svelte";
  import PasswordField from "./PasswordField.svelte";
  import Window, { type WindowAction } from "./Window.svelte";
  import { glyphFor, IconClose } from "./glyphs.js";

  // The window in front of the fortress, drawn from the flow's state: join,
  // joined, leave, remove, the phrase and its change.
  let {
    flow,
    flowState,
    text,
    lang,
    app,
    pairedWith,
    leaveNote,
    phraseQr,
    keys,
  }: {
    flow: FortressFlow;
    flowState: FortressState;
    text: FortressText;
    lang: string;
    app: { id: string; name: string };
    pairedWith?: string[];
    leaveNote?: string;
    phraseQr?: (words: string[]) => string;
    keys: FortressLabelKeys;
  } = $props();

  let card = $state<HTMLElement | null>(null);
  let copied = $state(false);
  const w = $derived(flowState.window!);
  const paired = $derived(pairedWith?.length ? listOf(lang, pairedWith) : null);
  const busy = $derived(flowState.busy !== null);
  const info = $derived(glyphFor("info"));

  const refusal = $derived(flowState.refusal);
  $effect(() => {
    const button = refusal && card?.querySelector<HTMLElement>(`[data-fortress="${refusal.button}"]`);
    if (button) return shake(button);
  });
  const focus = $derived(w.kind === "join" ? w.focus : -1);
  $effect(() => {
    if (focus >= 0) card?.querySelector<HTMLInputElement>(`[data-word="${focus}"]`)?.focus();
  });
  // The window stays mounted from one step to the next, so the focus it takes
  // on opening does not come again, and the button that was pressed may be gone.
  const kind = $derived(w.kind);
  let opened = false;
  $effect(() => {
    void kind;
    if (!opened) {
      opened = true;
      return;
    }
    const c = untrack(() => card);
    if (c) windowFocusTarget(c)?.focus();
  });
  $effect(() => {
    if (!copied) return;
    const t = setTimeout(() => (copied = false), COPIED_MS);
    return () => clearTimeout(t);
  });

  function send(button: string, run: () => Promise<void>, label: string, key: string, disabled = false): WindowAction {
    return {
      label,
      labelKey: key,
      primary: true,
      disabled: disabled || busy,
      attrs: { "data-fortress": button },
      onClick: () => {
        void run();
        return false;
      },
    };
  }
  // A space or a paste leaves other words in the field than the ones the flow keeps there.
  function enter(i: number, field: HTMLInputElement) {
    flow.enter(i, field.value);
    const held = w.kind === "join" ? w.words[i] : undefined;
    if (held !== undefined && field.value !== held) field.value = held;
  }
  function copy(words: string[]): WindowAction {
    return {
      label: text.copy,
      labelKey: keys.copy,
      attrs: { "data-fortress": "copy" },
      onClick: () => {
        void copyText(words.join(" ")).then((ok) => (copied = ok));
        return false;
      },
    };
  }
  const frame = $derived.by((): { title: string; size?: WindowSize; actions: WindowAction[] } => {
    switch (w.kind) {
      case "join":
        return { title: text.joinTitle, size: "wide", actions: [send("join", flow.join, text.join, keys.join, !phraseReady(w.words))] };
      case "joined":
        // Window adds Close only to a foot with something in it, so a window that only says something brings its own.
        return { title: text.joinTitle, actions: [{ label: text.close, labelKey: "common.close", glyph: IconClose, wayOut: true }] };
      case "leave":
        return { title: text.leaveTitle, actions: [send("leave", flow.leave, text.leaveConfirm, keys.leave)] };
      case "remove":
        return { title: fill(text.removeTitle, { device: w.device }), actions: [send("remove", flow.remove, text.remove, keys.remove)] };
      case "removed":
        return {
          title: text.removedTitle,
          actions: [{ label: text.later, labelKey: keys.later, wayOut: true, attrs: { "data-fortress": "later" } }, send("change", flow.change, text.changeConfirm, keys.changePhrase)],
        };
      case "phrase":
        return w.step === "password"
          ? { title: text.phraseTitle, actions: [send("unlock", flow.unlock, text.unlock, keys.unlock, w.password === "")] }
          : { title: text.phraseTitle, size: "wide", actions: [copy(w.words)] };
      case "change":
        return { title: text.changeTitle, actions: [send("change", flow.change, text.changeConfirm, keys.changePhrase)] };
      case "changed":
        return { title: text.changedTitle, size: "wide", actions: [copy(w.words)] };
    }
  });
</script>

{#snippet error()}
  {#if flowState.error}<p class="glim-fortress-error" role="alert">{flowState.error}</p>{/if}
{/snippet}

{#snippet words(list: string[])}
  {@const code = qrCode(phraseQr ? phraseQr(list) : list.join(" "))}
  {@const side = code.size + 8}
  <div class="glim-phrase-show">
    <ol class="glim-phrase-words" data-fortress="words">
      {#each list as word, i (i)}
        <li><span class="glim-phrase-number glim-num">{i + 1}</span>{word}</li>
      {/each}
    </ol>
    <!-- A camera reads dark modules on a light ground, so these two colours stay put in every theme. -->
    <svg class="glim-phrase-qr" data-fortress="qr" role="img" aria-label={text.qrName} viewBox={`-4 -4 ${side} ${side}`} shape-rendering="crispEdges">
      <rect x={-4} y={-4} width={side} height={side} fill="#ffffff" />
      <path d={code.path} fill="#161616" />
    </svg>
    <p class="glim-phrase-scan">{text.scanHint}</p>
  </div>
{/snippet}

<Window
  bind:ref={card}
  title={frame.title}
  size={frame.size}
  actions={frame.actions}
  start={copied ? text.copied : undefined}
  text={{ cancel: text.cancel, close: text.close }}
  onClose={flow.close}
>
  {#if w.kind === "join"}
    <form
      class="glim-fortress-text"
      onsubmit={(e) => {
        e.preventDefault();
        void flow.join();
      }}
    >
      <p>{text.about}</p>
      <div class="glim-phrase-fields">
        {#each w.words as word, i (i)}
          <label class="glim-phrase-field">
            <span class="glim-phrase-number glim-num">{i + 1}</span>
            <input
              class="glim-input"
              data-word={i}
              value={word}
              aria-label={fill(text.word, { n: i + 1 })}
              autocomplete="off"
              autocapitalize="none"
              autocorrect="off"
              spellcheck={false}
              oninput={(e) => enter(i, e.currentTarget)}
            />
          </label>
        {/each}
      </div>
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button type="submit" hidden></button>
      <p class="glim-fortress-sub">{text.phraseWhere}</p>
      {#if paired}
        <p class="glim-fortress-note" data-fortress="moves">
          {#if info}{@render info()}{/if}
          <span>{fill(text.moves, { app: app.name, devices: paired })}</span>
        </p>
      {/if}
      {@render error()}
    </form>
  {:else if w.kind === "joined"}
    <div class="glim-fortress-result">
      <span class="glim-fortress-result-mark" aria-hidden="true"><MarkSvg mark={MARKS.check} /></span>
      <div class="glim-fortress-text">
        <p class="glim-fortress-result-title">{fill(text.joinedTitle, { app: app.name })}</p>
        <p class="glim-fortress-sub">{paired ? `${fill(text.joinedMoved, { devices: paired })} ` : ""}{text.joinedNext}</p>
      </div>
    </div>
  {:else if w.kind === "leave"}
    <div class="glim-fortress-text">
      <p>{fill(text.leaveBody, { app: app.name })}{paired ? ` ${fill(text.leavePairing, { devices: paired })}` : ""}{leaveNote ? ` ${leaveNote}` : ""}</p>
      <p class="glim-fortress-sub">{text.leaveBack}</p>
      {@render error()}
    </div>
  {:else if w.kind === "remove"}
    <div class="glim-fortress-text">
      <p>{fill(text.removeBody, { device: w.device })}</p>
      <p class="glim-fortress-sub">{text.removeBack}</p>
      {@render error()}
    </div>
  {:else if w.kind === "removed"}
    <div class="glim-fortress-text">
      <p>{fill(text.removedBody, { device: w.device })}</p>
      {@render error()}
    </div>
  {:else if w.kind === "phrase" && w.step === "password"}
    <form
      class="glim-fortress-text"
      onsubmit={(e) => {
        e.preventDefault();
        void flow.unlock();
      }}
    >
      <p>{fill(text.phrasePassword, { app: app.name })}</p>
      <PasswordField
        aria-label={fill(text.password, { app: app.name })}
        placeholder={fill(text.password, { app: app.name })}
        value={w.password}
        oninput={(e) => flow.setPassword(e.currentTarget.value)}
        text={{ show: text.showPassword, hide: text.hidePassword }}
      />
      {@render error()}
    </form>
  {:else if w.kind === "phrase"}
    <div class="glim-fortress-text">
      <p>{text.phraseBody}</p>
      {@render words(w.words)}
    </div>
  {:else if w.kind === "change"}
    <div class="glim-fortress-text">
      <p>{text.changeBody}</p>
      <p class="glim-fortress-sub">{text.changeAway}</p>
      {@render error()}
    </div>
  {:else if w.kind === "changed"}
    <div class="glim-fortress-text">
      <p>{text.phraseBody}</p>
      {@render words(w.words)}
      {#if w.left.length > 0}<p class="glim-fortress-sub">{fill(text.changedLeft, { devices: listOf(lang, w.left) })}</p>{/if}
    </div>
  {/if}
</Window>
