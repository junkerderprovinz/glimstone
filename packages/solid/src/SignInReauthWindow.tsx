import { createEffect, createSignal, on, onCleanup, Show } from "solid-js";
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

export function SignInReauthWindow(props: SignInReauthWindowProps) {
  const r = props.api.reauth;
  const [s, setS] = createSignal(r.state());
  onCleanup(r.subscribe(() => setS(r.state())));
  createEffect(
    on(
      () => s().refused,
      (refused) => {
        if (refused === 0) return;
        const button = document.querySelector<HTMLElement>('[data-signin-reauth="confirm"]');
        if (button) onCleanup(shake(button));
      },
    ),
  );
  return (
    <Show when={s().asking}>
      <Window
        data-glim="SignInReauthWindow"
        title={props.text.title}
        text={{ cancel: props.text.cancel, close: props.text.close }}
        closeOnBackdrop={false}
        onClose={r.cancel}
        actions={[
          {
            label: props.text.confirm,
            labelKey: "confirm",
            primary: true,
            busy: s().busy,
            disabled: s().password === "",
            attrs: { "data-signin-reauth": "confirm" },
            onClick: () => {
              void r.submit();
              return false;
            },
          },
        ]}
      >
        <div class="glim-signin-tile-body">
          <p class="glim-signin-tile-text">{props.text.text}</p>
          <FieldRow label={props.text.password}>
            <PasswordField
              autocomplete="current-password"
              value={s().password}
              onInput={(e) => r.set(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                void r.submit();
              }}
              text={{ show: props.text.show, hide: props.text.hide }}
              error={signInReauthError(props.text, s().error)}
            />
          </FieldRow>
        </div>
      </Window>
    </Show>
  );
}
