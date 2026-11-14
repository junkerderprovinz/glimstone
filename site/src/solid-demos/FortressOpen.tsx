import { createSignal, For, Show } from "solid-js";
import { FortressAppCard, FortressStatusWindow } from "@glimstone/solid";
import { fortressTextEn as text, memberName, openRefusalText, type FortressApp, type FortressInstance } from "@glimstone/core";
import { OPEN_APPS, STATUS_LOG, STATUS_REPORT } from "../fortressData";

// Open goes through the app's onOpen: Delta is a plugin and shows its status,
// Echo refuses until it has a password, which the app's toast says, and the
// two Bravos on Atlas ask first.
export default function FortressOpen() {
  const [said, setSaid] = createSignal("Nothing yet");
  const [status, setStatus] = createSignal<{ app: FortressApp; instance: FortressInstance } | null>(null);
  const onOpen = (app: FortressApp, instance: FortressInstance) => {
    if (instance.form === "plugin") setStatus({ app, instance });
    else if (app.id === "echo") setSaid(`Toast: ${openRefusalText(text, "ui_no_login")}`);
    else setSaid(`Opened ${memberName(text, app, instance)} (${instance.id})`);
  };
  return (
    <div class="fortress-demo">
      <div class="glim-fortress-grid">
        <For each={OPEN_APPS}>{(a, i) => <FortressAppCard app={a} text={text} lang="en" hueIndex={i()} onOpen={onOpen} />}</For>
      </div>
      <Show when={status()}>
        {(s) => <FortressStatusWindow app={s().app} instance={s().instance} report={STATUS_REPORT} log={STATUS_LOG} text={text} lang="en" onClose={() => setStatus(null)} />}
      </Show>
      <output data-hook="said">{said()}</output>
    </div>
  );
}
