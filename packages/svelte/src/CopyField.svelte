<script lang="ts" module>
  import type { FieldWidth } from "@glimstone/core";

  export interface CopyFieldProps {
    value: string;
    /** The field's accessible name, such as "Token". Inside a FieldRow the row gives it. */
    label?: string;
    width?: FieldWidth;
    /** The button's words, before and for a moment after it copied. */
    text?: { copy: string; copied: string };
    /** Called after every press, with whether the value reached the clipboard. */
    onCopy?: (done: boolean) => void;
    /** Classes for the row, which carries the width. */
    class?: string;
  }
</script>

<script lang="ts">
  import { COPIED_MS, copyText, fieldWidthClass } from "@glimstone/core";
  import Button from "./Button.svelte";
  import { useFieldName } from "./fieldName.js";
  import { IconCheck, IconCopy } from "./glyphs.js";

  // A value somebody copies rather than types, such as a token, a path or an
  // address: the value in monospace and a button that copies it and says so for
  // a moment. Where the browser refuses to copy, the value is selected instead,
  // so Ctrl+C still works.
  let { value, label, width, text = { copy: "Copy", copied: "Copied" }, onCopy, class: className }: CopyFieldProps = $props();

  const name = useFieldName(() => label);
  let copied = $state(false);
  let field: HTMLInputElement;
  let timer: number | undefined;
  $effect(() => () => clearTimeout(timer));

  async function copy() {
    const done = await copyText(value);
    onCopy?.(done);
    if (!done) {
      field.focus();
      field.select();
      return;
    }
    copied = true;
    clearTimeout(timer);
    timer = window.setTimeout(() => (copied = false), COPIED_MS);
  }
</script>

<span data-glim="CopyField" class={["glim-copy", fieldWidthClass(width), className].filter(Boolean).join(" ")}>
  <input bind:this={field} readonly {value} aria-label={name()} spellcheck={false} class="glim-input glim-input--mono" />
  <Button
    label={copied ? text.copied : text.copy}
    labelKey={copied ? "copied" : "copy"}
    glyph={copied ? IconCheck : IconCopy}
    variant="icon"
    onClick={copy}
  />
  <span role="status" class="glim-sr-only">{copied ? text.copied : ""}</span>
</span>
