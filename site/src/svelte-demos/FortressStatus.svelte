<script lang="ts">
  import { Button, FortressStatusWindow } from "@glimstone/svelte";
  import { fortressTextEn as text, openRefusalText } from "@glimstone/core";
  import { OPEN_APPS, STATUS_LOG, STATUS_REPORT } from "../fortressData";

  // The status window of a plugin while its report comes, once it is there,
  // and when it does not come.
  const delta = OPEN_APPS.find((a) => a.id === "delta")!;
  let shown = $state<"report" | "loading" | "error" | null>(null);
</script>

<div class="fortress-demo">
  <div class="demo-buttons">
    <Button label="With a report" labelKey={null} onClick={() => (shown = "report")} data-hook="report" />
    <Button label="Loading" labelKey={null} onClick={() => (shown = "loading")} data-hook="loading" />
    <Button label="Not reached" labelKey={null} onClick={() => (shown = "error")} data-hook="error" />
  </div>
  {#if shown}
    <FortressStatusWindow
      app={delta}
      instance={delta.instances[0]!}
      report={shown === "report" ? STATUS_REPORT : undefined}
      log={shown === "report" ? STATUS_LOG : undefined}
      loading={shown === "loading"}
      error={shown === "error" ? openRefusalText(text, "unreachable") : undefined}
      {text}
      lang="en"
      onClose={() => (shown = null)}
    />
  {/if}
</div>
