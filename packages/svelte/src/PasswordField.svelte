<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { FieldWidth, PasswordFieldText } from "@glimstone/core";

  export interface PasswordFieldProps extends Omit<HTMLInputAttributes, "type" | "width" | "class"> {
    width?: FieldWidth;
    /** Attributes for the eye, such as a data hook. */
    eyeAttrs?: Record<string, string>;
    /** The eye's words, and the second field's with `confirm`. English where left out. */
    text?: Partial<PasswordFieldText>;
    /** Why the value cannot stand, as a line under the field until it is fixed. */
    error?: string;
    /** A quiet line under the field that only informs, such as a hint about the value. An error takes its place. */
    note?: string;
    /** Asks for the password again in a second field, which stands once the first holds something. */
    confirm?: boolean;
    /** Whether both fields hold the same password, each time that changes. Set password waits for true. */
    onConfirmedChange?: (confirmed: boolean) => void;
    /** Classes for the wrapper, which carries the field's width. */
    class?: string;
    /** The <input>, bound with `bind:ref`. */
    ref?: HTMLInputElement | null;
  }
</script>

<script lang="ts">
  import { fieldErrorView, fieldNoteView, fieldWidthClass, PASSWORD_FIELD_TEXT, passwordConfirmView } from "@glimstone/core";
  import FieldError from "./FieldError.svelte";
  import { useFieldName } from "./fieldName.js";
  import { IconEye, IconEyeOff } from "./glyphs.js";
  import IconTipButton from "./IconTipButton.svelte";

  // A field for a secret with the reveal eye inside it ("The reveal eye" in the
  // design language). The props are a native <input>'s, so a call site swaps
  // `<input type="password"` for `<PasswordField` and keeps its own listeners;
  // the secret is bound with `bind:value`. Inside a FieldRow the row names it.
  // With `confirm` it takes a new password, typed twice.
  let {
    width,
    eyeAttrs,
    text,
    error,
    note,
    confirm = false,
    onConfirmedChange,
    class: className,
    ref = $bindable(null),
    disabled,
    value = $bindable(),
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
    ...rest
  }: PasswordFieldProps = $props();

  const words = $derived({ ...PASSWORD_FIELD_TEXT, ...text });
  let shown = $state(false);
  let repeatShown = $state(false);
  let repeat = $state("");
  const name = useFieldName(() => ariaLabel ?? undefined);
  const own = $props.id();
  const id = $derived(rest.id ?? own);
  const quiet = $derived(fieldNoteView(note, error, id, describedBy ?? undefined));
  const err = $derived(fieldErrorView(error, id, quiet.describedBy));
  const view = $derived(passwordConfirmView(value == null ? "" : String(value), repeat));
  const mismatch = $derived(fieldErrorView(view.mismatch ? words.mismatch : undefined, `${id}-confirm`));
  $effect(() => {
    if (!view.shown) repeat = "";
  });
  const confirmed = $derived(confirm && view.confirmed);
  $effect(() => onConfirmedChange?.(confirmed));
</script>

<span data-glim="PasswordField" class={["glim-secret", fieldWidthClass(width), className].filter(Boolean).join(" ")}>
  <input
    autocomplete={confirm ? "new-password" : "current-password"}
    spellcheck={false}
    {...rest}
    aria-label={name()}
    aria-invalid={err.invalid}
    aria-describedby={err.describedBy}
    bind:this={ref}
    bind:value
    {disabled}
    type={shown ? "text" : "password"}
    class="glim-input"
  />
  <IconTipButton {...eyeAttrs} tip={shown ? words.hide : words.show} class="glim-secret-eye" disabled={!!disabled} onclick={() => (shown = !shown)}>
    {#if shown}{@render IconEyeOff()}{:else}{@render IconEye()}{/if}
  </IconTipButton>
</span>
{#if err.errorId}<FieldError id={err.errorId}>{error}</FieldError>{/if}
{#if quiet.noteId}<span id={quiet.noteId} class="glim-field-note">{note}</span>{/if}
{#if confirm && view.shown}
  <span class="glim-secret-confirm">
    <label for="{id}-confirm" class="glim-secret-confirm-label">{words.confirm}</label>
    <span class={["glim-secret-confirm-box", fieldWidthClass(width)].filter(Boolean).join(" ")}>
      <span class="glim-secret">
        <input
          id="{id}-confirm"
          autocomplete="new-password"
          spellcheck={false}
          bind:value={repeat}
          aria-invalid={mismatch.invalid}
          aria-describedby={mismatch.describedBy}
          {disabled}
          type={repeatShown ? "text" : "password"}
          class="glim-input"
        />
        <IconTipButton tip={repeatShown ? words.hide : words.show} class="glim-secret-eye" disabled={!!disabled} onclick={() => (repeatShown = !repeatShown)}>
          {#if repeatShown}{@render IconEyeOff()}{:else}{@render IconEye()}{/if}
        </IconTipButton>
      </span>
      <span aria-live="polite" class="glim-secret-confirm-live">
        {#if mismatch.errorId}<FieldError id={mismatch.errorId}>{words.mismatch}</FieldError>{/if}
      </span>
    </span>
  </span>
{/if}
