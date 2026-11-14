import { createSignal, Show } from "solid-js";
import { Button, FortressStatusWindow } from "@glimstone/solid";
import { fortressTextEn as text, openRefusalText } from "@glimstone/core";
import { OPEN_APPS, STATUS_LOG, STATUS_REPORT } from "../fortressData";

// The status window of a plugin while its report comes, once it is there,
// and when it does not come.
const delta = OPEN_APPS.find((a) => a.id === "delta")!;

export default function FortressStatus() {
  const [shown, setShown] = createSignal<"report" | "loading" | "error" | null>(null);
  return (
    <div class="fortress-demo">
      <div class="demo-buttons">
        <Button label="With a report" labelKey={null} onClick={() => setShown("report")} data-hook="report" />
        <Button label="Loading" labelKey={null} onClick={() => setShown("loading")} data-hook="loading" />
        <Button label="Not reached" labelKey={null} onClick={() => setShown("error")} data-hook="error" />
      </div>
      <Show when={shown()}>
        <FortressStatusWindow
          app={delta}
          instance={delta.instances[0]!}
          report={shown() === "report" ? STATUS_REPORT : undefined}
          log={shown() === "report" ? STATUS_LOG : undefined}
          loading={shown() === "loading"}
          error={shown() === "error" ? openRefusalText(text, "unreachable") : undefined}
          text={text}
          lang="en"
          onClose={() => setShown(null)}
        />
      </Show>
    </div>
  );
}
