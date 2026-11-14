import { createSignal, mergeProps, onCleanup, onMount, splitProps, type JSX } from "solid-js";
import { fieldWidthClass, PATH_ROOM_PX, type FieldWidth } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { useFieldName } from "./fieldName.ts";
import { IconFolderOpen } from "./glyphs.tsx";

// A path to type and a button that asks the app for one. GlimStone does not
// know where an app's folders come from, so `pick` is the app's own: it opens
// whatever it opens and answers with a path. The other props of an <input> go
// to the field.

export interface PathFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "width" | "class" | "ref"> {
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
  glyph?: JSX.Element;
  /** Shows the button's glyph alone, as it does by itself with less than 20rem of room. */
  compact?: boolean;
  /** Attributes for the button, such as a data hook. */
  buttonAttrs?: Record<string, string>;
  /** Classes for the wrapper, which carries the width. */
  class?: string;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
}

export function PathField(props: PathFieldProps) {
  const merged = mergeProps({ text: { pick: "Choose" }, compact: false }, props);
  const [own, rest] = splitProps(merged, [
    "value", "onChange", "pick", "onPicked", "label", "width", "text", "glyph", "compact", "buttonAttrs", "class", "style", "disabled", "ref",
  ]);
  const name = useFieldName(() => own.label);
  const [tight, setTight] = createSignal(false);
  let input!: HTMLInputElement;
  let box!: HTMLSpanElement;
  onMount(() => {
    const watcher = new ResizeObserver(([entry]) => setTight(entry!.contentRect.width < PATH_ROOM_PX));
    watcher.observe(box);
    onCleanup(() => watcher.disconnect());
  });

  async function ask() {
    const answer = await own.pick(own.value);
    input.focus();
    if (!answer) return;
    own.onChange(answer);
    own.onPicked?.(answer);
  }

  return (
    <span data-glim="PathField" ref={box} class={["glim-path", fieldWidthClass(own.width), own.class].filter(Boolean).join(" ")} style={own.style}>
      <input
        spellcheck={false}
        autocomplete="off"
        aria-label={name()}
        {...rest}
        ref={(el) => {
          input = el;
          if (typeof own.ref === "function") own.ref(el);
        }}
        type="text"
        value={own.value}
        disabled={own.disabled}
        onInput={(e) => own.onChange(e.currentTarget.value)}
        class="glim-input glim-input--mono"
      />
      <Button
        {...own.buttonAttrs}
        variant="icon"
        label={own.text.pick}
        labelKey={null}
        glyph={own.glyph ?? <IconFolderOpen />}
        compact={own.compact || tight()}
        disabled={own.disabled}
        onClick={ask}
      />
    </span>
  );
}
