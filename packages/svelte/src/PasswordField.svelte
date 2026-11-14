<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { FieldWidth } from "@glimstone/core";

  export interface PasswordFieldProps extends Omit<HTMLInputAttributes, "type" | "width" | "class"> {
    width?: FieldWidth;
    /** Attributes for the eye, such as a data hook. */
    eyeAttrs?: Record<string, string>;
    /** The eye's name and bubble while the secret is hidden, and once it shows. */
    text?: { show: string; hide: string };
    /** Why the value cannot stand, as a line under the field until it is fixed. */
    error?: string;
    /** Classes for the wrapper, which carries the field's width. */
    class?: string;
    /** The <input>, bound with `bind:ref`. */
    ref?: HTMLInputElement | null;
  }
</script>

<script lang="ts">
  import { fieldErrorView, fieldWidthClass } from "@glimstone/core";
  import FieldError from "./FieldError.svelte";
  import { useFieldName } from "./fieldName.js";
  import { IconEye, IconEyeOff } from "./glyphs.js";
  import IconTipButton from "./IconTipButton.svelte";

  // A field for a secret with the reveal eye inside it ("The reveal eye" in the
  // design language). The props are a native <input>'s, so a call site swaps
  // `<input type="password"` for `<PasswordField` and keeps its own listeners;
  // the secret is bound with `bind:value`. Inside a FieldRow the row names it.
  let {
    width,
    eyeAttrs,
    text = { show: "Show", hide: "Hide" },
    error,
    class: className,
    ref = $bindable(null),
    disabled,
    value = $bindable(),
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
    ...rest
  }: PasswordFieldProps = $props();

  let shown = $state(false);
  const name = useFieldName(() => ariaLabel ?? undefined);
  const own = $props.id();
  const err = $derived(fieldErrorView(error, rest.id ?? own, describedBy ?? undefined));
</script>

<span data-glim="PasswordField" class={["glim-secret", fieldWidthClass(width), className].filter(Boolean).join(" ")}>
  <input
    autocomplete="current-password"
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
  <IconTipButton {...eyeAttrs} tip={shown ? text.hide : text.show} class="glim-secret-eye" disabled={!!disabled} onclick={() => (shown = !shown)}>
    {#if shown}{@render IconEyeOff()}{:else}{@render IconEye()}{/if}
  </IconTipButton>
</span>
{#if err.errorId}<FieldError id={err.errorId}>{error}</FieldError>{/if}
