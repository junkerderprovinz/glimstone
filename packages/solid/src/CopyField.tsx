import { createSignal, mergeProps, onCleanup } from "solid-js";
import { COPIED_MS, copyText, fieldWidthClass, type FieldWidth } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { useFieldName } from "./fieldName.ts";
import { IconCheck, IconCopy } from "./glyphs.tsx";

// A value somebody copies rather than types, such as a token, a path or an
// address: the value in monospace and a button that copies it and says so for
// a moment. Where the browser refuses to copy, the value is selected instead,
// so Ctrl+C still works.

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

export function CopyField(props: CopyFieldProps) {
  const merged = mergeProps({ text: { copy: "Copy", copied: "Copied" } }, props);
  const name = useFieldName(() => merged.label);
  const [copied, setCopied] = createSignal(false);
  let field!: HTMLInputElement;
  let timer: number | undefined;
  onCleanup(() => clearTimeout(timer));

  async function copy() {
    const done = await copyText(merged.value);
    merged.onCopy?.(done);
    if (!done) {
      field.focus();
      field.select();
      return;
    }
    setCopied(true);
    clearTimeout(timer);
    timer = window.setTimeout(() => setCopied(false), COPIED_MS);
  }

  return (
    <span data-glim="CopyField" class={["glim-copy", fieldWidthClass(merged.width), merged.class].filter(Boolean).join(" ")}>
      <input ref={field} readonly value={merged.value} aria-label={name()} spellcheck={false} class="glim-input glim-input--mono" />
      <Button
        label={copied() ? merged.text.copied : merged.text.copy}
        labelKey={copied() ? "copied" : "copy"}
        glyph={copied() ? <IconCheck /> : <IconCopy />}
        variant="icon"
        onClick={copy}
      />
      <span role="status" class="glim-sr-only">
        {copied() ? merged.text.copied : ""}
      </span>
    </span>
  );
}
