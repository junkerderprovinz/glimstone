<script lang="ts" module>
  import type { SignInApi, SignInReauthText } from "@glimstone/core";

  export type { SignInReauthText } from "@glimstone/core";

  export interface SignInReauthWindowProps {
    api: SignInApi;
    text: SignInReauthText;
  }
</script>

<script lang="ts">
  import { shake, signInReauthError, type SignInReauthState } from "@glimstone/core";
  import FieldRow from "./FieldRow.svelte";
  import PasswordField from "./PasswordField.svelte";
  import Window from "./Window.svelte";

  // The password question before a change the kit wants fresh ("The sign-in
  // tile" in the design language). Mounted once beside the tiles, it opens when
  // a change answers signInAgain with askPassword, and the change runs again
  // once the password is confirmed. While it is mounted the client asks.
  let { api, text }: SignInReauthWindowProps = $props();

  const r = $derived(api.reauth);
  let s = $state.raw<SignInReauthState | null>(null);
  $effect(() => {
    const reauth = r;
    s = reauth.state();
    return reauth.subscribe(() => (s = reauth.state()));
  });

  const refused = $derived(s?.refused ?? 0);
  $effect(() => {
    if (refused === 0) return;
    const button = document.querySelector<HTMLElement>('[data-signin-reauth="confirm"]');
    if (button) return shake(button);
  });

  function enter(e: KeyboardEvent) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    void r.submit();
  }
</script>

{#if s?.asking}
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
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{text.text}</p>
      <FieldRow label={text.password}>
        <PasswordField
          autocomplete="current-password"
          value={s.password}
          oninput={(e) => r.set(e.currentTarget.value)}
          onkeydown={enter}
          text={{ show: text.show, hide: text.hide }}
          error={signInReauthError(text, s.error)}
        />
      </FieldRow>
    </div>
  </Window>
{/if}
