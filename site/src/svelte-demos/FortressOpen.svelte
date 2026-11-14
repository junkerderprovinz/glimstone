<script lang="ts">
  import { FortressAppCard, FortressStatusWindow } from "@glimstone/svelte";
  import { fortressTextEn as text, memberName, openRefusalText, type FortressApp, type FortressInstance } from "@glimstone/core";
  import { OPEN_APPS, STATUS_LOG, STATUS_REPORT } from "../fortressData";

  // Open goes through the app's onOpen: Delta is a plugin and shows its status,
  // Echo refuses until it has a password, which the app's toast says, and the
  // two Bravos on Atlas ask first.
  let said = $state("Nothing yet");
  let status = $state.raw<{ app: FortressApp; instance: FortressInstance } | null>(null);
  function onOpen(app: FortressApp, instance: FortressInstance) {
    if (instance.form === "plugin") status = { app, instance };
    else if (app.id === "echo") said = `Toast: ${openRefusalText(text, "ui_no_login")}`;
    else said = `Opened ${memberName(text, app, instance)} (${instance.id})`;
  }
</script>

<div class="fortress-demo">
  <div class="glim-fortress-grid">
    {#each OPEN_APPS as a, i (a.id)}
      <FortressAppCard app={a} {text} lang="en" hueIndex={i} {onOpen} />
    {/each}
  </div>
  {#if status}
    <FortressStatusWindow app={status.app} instance={status.instance} report={STATUS_REPORT} log={STATUS_LOG} {text} lang="en" onClose={() => (status = null)} />
  {/if}
  <output data-hook="said">{said}</output>
</div>
