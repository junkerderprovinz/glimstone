import { mergeProps, splitProps, type JSX } from "solid-js";
import { fieldWidthClass, type FieldWidth } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";

// A field with a glyph inside it, such as a filter or a search. The box is the
// field: it steps up the ramp while the input has focus (rule 14), and being a
// <label> it hands a click on the glyph to the input. The other props of an
// <input> go to the input.

export interface GlyphFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "width" | "class"> {
  glyph: JSX.Element;
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Controls inside the box, after the field, such as a clear button. */
  after?: JSX.Element;
  /** Sets a path or a token in monospace. */
  mono?: boolean;
  width?: FieldWidth;
  /** Classes for the box, which carries the width. */
  class?: string;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
}

export function GlyphField(props: GlyphFieldProps) {
  const merged = mergeProps({ type: "text" }, props);
  const [own, rest] = splitProps(merged, ["glyph", "label", "after", "mono", "width", "class", "style", "type"]);
  const name = useFieldName(() => own.label);
  const classes = () => ["glim-input", "glim-glyph-field", fieldWidthClass(own.width), own.mono && "glim-input--mono", own.class].filter(Boolean).join(" ");
  return (
    <label data-glim="GlyphField" class={classes()} style={own.style}>
      <span class="glim-glyph-field-glyph" aria-hidden="true">
        {own.glyph}
      </span>
      <input aria-label={name()} {...rest} type={own.type} class="glim-glyph-field-input" />
      {own.after}
    </label>
  );
}
