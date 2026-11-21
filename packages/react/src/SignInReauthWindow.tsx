import { useEffect, useSyncExternalStore } from "react";
import { shake, signInReauthError, type SignInApi, type SignInReauthText } from "@glimstone/core";
import { FieldRow } from "./FieldRow.tsx";
import { PasswordField } from "./PasswordField.tsx";
import { Window } from "./Window.tsx";

export type { SignInReauthText } from "@glimstone/core";

// The password question before a change the kit wants fresh ("The sign-in
// tile" in the design language). Mounted once beside the tiles, it opens when
// a change answers signInAgain with askPassword, and the change runs again
// once the password is confirmed. While it is mounted the client asks.

export interface SignInReauthWindowProps {
  api: SignInApi;
  text: SignInReauthText;
}

export function SignInReauthWindow({ api, text }: SignInReauthWindowProps) {
  const r = api.reauth;
  const s = useSyncExternalStore(r.subscribe, r.state, r.state);
  useEffect(() => {
    if (s.refused === 0) return;
    const button = document.querySelector<HTMLElement>('[data-signin-reauth="confirm"]');
    return button ? shake(button) : undefined;
  }, [s.refused]);
  if (!s.asking) return null;
  return (
    <Window
      data-glim="SignInReauthWindow"
      title={text.title}
      text={{ cancel: text.cancel, close: text.close }}
      closeOnBackdrop={false}
      onClose={r.cancel}
      actions={[
        {
          label: text.confirm,
          labelKey: "confirm",
          primary: true,
          busy: s.busy,
          disabled: s.password === "",
          attrs: { "data-signin-reauth": "confirm" },
          onClick: () => {
            void r.submit();
            return false;
          },
        },
      ]}
    >
      <div className="glim-signin-tile-body">
        <p className="glim-signin-tile-text">{text.text}</p>
        <FieldRow label={text.password}>
          <PasswordField
            autoComplete="current-password"
            value={s.password}
            onChange={(e) => r.set(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              void r.submit();
            }}
            text={{ show: text.show, hide: text.hide }}
            error={signInReauthError(text, s.error)}
          />
        </FieldRow>
      </div>
    </Window>
  );
}
