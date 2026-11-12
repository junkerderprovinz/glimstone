import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { fieldWidthClass, type FieldWidth } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";

// A field with a glyph inside it, such as a filter or a search. The box is the
// field: it steps up the ramp while the input has focus (rule 14), and being a
// <label> it hands a click on the glyph to the input. The other props of an
// <input> go to the input.

export interface GlyphFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "width"> {
  glyph: ReactNode;
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Controls inside the box, after the field, such as a clear button. */
  after?: ReactNode;
  /** Sets a path or a token in monospace. */
  mono?: boolean;
  width?: FieldWidth;
  /** Classes for the box, which carries the width. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

export function GlyphField({ glyph, label, after, mono, width, className, style, type = "text", ...rest }: GlyphFieldProps) {
  const name = useFieldName(label);
  const classes = ["glim-input", "glim-glyph-field", fieldWidthClass(width), mono && "glim-input--mono", className].filter(Boolean).join(" ");
  return (
    <label data-glim="GlyphField" className={classes} style={style}>
      <span className="glim-glyph-field-glyph" aria-hidden="true">
        {glyph}
      </span>
      <input aria-label={name} {...rest} type={type} className="glim-glyph-field-input" />
      {after}
    </label>
  );
}
