import { useEffect, useRef, useState } from "react";
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
  className?: string;
}

export function CopyField({ value, label, width, text = { copy: "Copy", copied: "Copied" }, onCopy, className }: CopyFieldProps) {
  const name = useFieldName(label);
  const [copied, setCopied] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const done = await copyText(value);
    onCopy?.(done);
    if (!done) {
      field.current?.focus();
      field.current?.select();
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  }

  return (
    <span className={["glim-copy", fieldWidthClass(width), className].filter(Boolean).join(" ")}>
      <input ref={field} readOnly value={value} aria-label={name} spellCheck={false} className="glim-input glim-input--mono" />
      <Button
        label={copied ? text.copied : text.copy}
        labelKey={copied ? "copied" : "copy"}
        glyph={copied ? <IconCheck /> : <IconCopy />}
        variant="icon"
        onClick={copy}
      />
      <span role="status" className="glim-sr-only">
        {copied ? text.copied : ""}
      </span>
    </span>
  );
}
