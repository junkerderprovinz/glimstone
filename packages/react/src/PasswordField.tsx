import { useState, type InputHTMLAttributes, type Ref } from "react";
import { IconEye, IconEyeOff } from "./glyphs.tsx";
import { IconTipButton } from "./IconTipButton.tsx";

// A field for a secret with the reveal eye inside it ("The reveal eye" in the
// design language). The props are a native <input>'s, so a call site swaps
// `<input type="password"` for `<PasswordField` and keeps its own onChange.

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** The eye's name and bubble while the secret is hidden, and once it shows. */
  text?: { show: string; hide: string };
  /** Classes for the wrapper, which carries the field's width. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

export function PasswordField({ text = { show: "Show", hide: "Hide" }, className, ref, disabled, ...rest }: PasswordFieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <span className={className ? `glim-secret ${className}` : "glim-secret"}>
      <input
        autoComplete="current-password"
        spellCheck={false}
        {...rest}
        ref={ref}
        disabled={disabled}
        type={shown ? "text" : "password"}
        className="glim-input"
      />
      <IconTipButton tip={shown ? text.hide : text.show} className="glim-secret-eye" disabled={disabled} onClick={() => setShown(!shown)}>
        {shown ? <IconEyeOff /> : <IconEye />}
      </IconTipButton>
    </span>
  );
}
