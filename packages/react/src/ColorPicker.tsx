import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  COLOR_NAMES_DE,
  COLOR_PICKER_TEXT,
  colorPicker,
  floatColorPicker,
  nearestColorName,
  normalizeHex,
  type ColorName,
  type ColorPicker as Widget,
  type ColorPickerPanelText,
} from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconCheck } from "./glyphs.tsx";

export type { ColorName, ColorPickerPanelText } from "@glimstone/core";

// The colour picker as a component: the core's square and hue bar, a preview
// with the name the colour proposes, the hex field and Apply. Nothing changes
// until Apply, so a caller can show the colour live through onInput and still
// keep the old one when the picker closes without it.

export interface ColorPickerProps {
  /** The colour the picker starts from, as `#rrggbb`. */
  value: string;
  /** Apply or Enter, with the colour and the name it proposes. */
  onApply: (hex: string, name: string | null) => void;
  /** Every step of a drag, a key or a valid hex, for a live preview. */
  onInput?: (hex: string) => void;
  /** The control that opened the picker. With it the picker floats beside it
   *  and closes on Escape, on a click beside it and after Apply. */
  anchor?: HTMLElement | null;
  /** Called when a floating picker closes, however it closes. */
  onClose?: () => void;
  /** The names a colour is matched against, nearest in OKLab. `false` shows none. */
  names?: readonly ColorName[] | false;
  /** The words, read when the picker opens. */
  text?: Partial<ColorPickerPanelText>;
  className?: string;
}

export function ColorPicker({ value, onApply, onInput, anchor, onClose, names = COLOR_NAMES_DE, text, className }: ColorPickerProps) {
  const words = { ...COLOR_PICKER_TEXT, ...text };
  const panel = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<Widget | null>(null);
  const [draft, setDraft] = useState(() => normalizeHex(value) ?? "#000000");
  const [typed, setTyped] = useState(draft);
  const latest = useRef({ onInput, onClose });
  useLayoutEffect(() => {
    latest.current = { onInput, onClose };
  });

  useLayoutEffect(() => {
    const picker = colorPicker(
      draft,
      (hex) => {
        setDraft(hex);
        setTyped(hex);
        latest.current.onInput?.(hex);
      },
      { text: words },
    );
    host.current!.appendChild(picker.el);
    widget.current = picker;
    return () => picker.el.remove();
    // Built once; a new value reaches it through setValue below.
  }, []);

  useEffect(() => {
    const hex = normalizeHex(value);
    if (!hex) return;
    setDraft(hex);
    setTyped(hex);
    widget.current?.setValue(hex);
  }, [value]);

  useLayoutEffect(() => {
    if (!anchor || !panel.current) return;
    const done = floatColorPicker(panel.current, anchor, () => latest.current.onClose?.());
    widget.current?.focus();
    return done;
  }, [anchor]);

  const name = names === false ? null : nearestColorName(draft, names);

  function apply() {
    onApply(draft, name);
    if (anchor) {
      anchor.focus();
      onClose?.();
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      apply();
    }
  }

  const body = (
    <div
      data-glim="ColorPicker"
      ref={panel}
      className={["glim-picker-panel", anchor && "glim-picker-panel--float", className].filter(Boolean).join(" ")}
      style={{ "--glim-picker-colour": draft } as CSSProperties}
      onKeyDown={onKeyDown}
    >
      <div ref={host} style={{ display: "contents" }} />
      <div className="glim-picker-foot">
        <span className="glim-picker-swatch" aria-hidden="true" />
        {name !== null && <span className="glim-picker-name">{name}</span>}
        <input
          className="glim-picker-hex"
          value={typed}
          maxLength={7}
          spellCheck={false}
          aria-label={words.hex}
          onChange={(e) => {
            setTyped(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (!hex) return;
            setDraft(hex);
            widget.current?.setValue(hex);
            onInput?.(hex);
          }}
        />
      </div>
      <div className="glim-picker-actions">
        <Button label={words.apply} labelKey="apply" glyph={<IconCheck />} tone="accent" onClick={apply} />
      </div>
    </div>
  );
  return anchor ? createPortal(body, document.body) : body;
}
