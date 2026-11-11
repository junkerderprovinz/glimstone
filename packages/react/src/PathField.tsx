import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { fieldWidthClass, PATH_ROOM_PX, type FieldWidth } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { useFieldName } from "./fieldName.ts";
import { IconFolderOpen } from "./glyphs.tsx";

// A path to type and a button that asks the app for one. GlimStone does not
// know where an app's folders come from, so `pick` is the app's own: it opens
// whatever it opens and answers with a path. The other props of an <input> go
// to the field.

export interface PathFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "width"> {
  value: string;
  /** Called with the path as it is typed and as the picker answers. */
  onChange: (path: string) => void;
  /** Handed the path in the field. Answers with a path, or with nothing when the person left. */
  pick: (current: string) => string | null | undefined | Promise<string | null | undefined>;
  /** Called with a path the picker answered with, after onChange. */
  onPicked?: (path: string) => void;
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  width?: FieldWidth;
  /** The button's words. */
  text?: { pick: string };
  /** The button's glyph, an open folder unless set, such as a file for a picker of files. */
  glyph?: ReactNode;
  /** Shows the button's glyph alone, as it does by itself with less than 20rem of room. */
  compact?: boolean;
  /** Attributes for the button, such as a data hook. */
  buttonAttrs?: Record<string, string>;
  /** Classes for the wrapper, which carries the width. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

export function PathField({
  value,
  onChange,
  pick,
  onPicked,
  label,
  width,
  text = { pick: "Choose" },
  glyph = <IconFolderOpen />,
  compact = false,
  buttonAttrs,
  className,
  style,
  disabled,
  ref,
  ...rest
}: PathFieldProps) {
  const name = useFieldName(label);
  const own = useRef<HTMLInputElement | null>(null);
  const box = useRef<HTMLSpanElement>(null);
  const [tight, setTight] = useState(false);
  useEffect(() => {
    const watcher = new ResizeObserver(([entry]) => setTight(entry!.contentRect.width < PATH_ROOM_PX));
    watcher.observe(box.current!);
    return () => watcher.disconnect();
  }, []);

  async function ask() {
    const answer = await pick(value);
    own.current?.focus();
    if (!answer) return;
    onChange(answer);
    onPicked?.(answer);
  }

  return (
    <span ref={box} className={["glim-path", fieldWidthClass(width), className].filter(Boolean).join(" ")} style={style}>
      <input
        spellCheck={false}
        autoComplete="off"
        aria-label={name}
        {...rest}
        ref={(el) => {
          own.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="glim-input glim-input--mono"
      />
      <Button {...buttonAttrs} variant="icon" label={text.pick} labelKey={null} glyph={glyph} compact={compact || tight} disabled={disabled} onClick={ask} />
    </span>
  );
}
