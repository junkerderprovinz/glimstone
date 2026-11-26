// The error line the fields draw under themselves. Once the value is fixed it
// stays a moment with data-closing, so the stylesheet can close it as softly
// as it opened instead of the form jumping.

import { useEffect, useRef, useState } from "react";
import { TOAST_MARKS, whenFieldErrorClosed } from "@glimstone/core";
import { MarkSvg } from "./glyphs.tsx";

export function FieldErrorLine({ id, error }: { id: string | undefined; error: string | undefined }) {
  const [shown, setShown] = useState(id && error ? { id, error } : null);
  const line = useRef<HTMLSpanElement>(null);
  if (id && error && (shown?.id !== id || shown.error !== error)) setShown({ id, error });
  const closing = !error && shown !== null;
  useEffect(() => (closing && line.current ? whenFieldErrorClosed(line.current, () => setShown(null)) : undefined), [closing]);
  if (!shown) return null;
  return (
    <span ref={line} data-glim="FieldError" id={closing ? undefined : shown.id} data-closing={closing ? "" : undefined} className="glim-field-error">
      <MarkSvg mark={TOAST_MARKS.fail} />
      {shown.error}
    </span>
  );
}
