<script lang="ts">
  import { NotifyCard } from "@glimstone/svelte";
  import { demoNotify, NOTIFY_APP, NOTIFY_CHECKS, NOTIFY_ELSEWHERE, NOTIFY_EVENTS, NOTIFY_PROVIDERS, NOTIFY_TEXT } from "../notifyData";

  // Four channels of a made-up app. Discord's test comes back refused, and a
  // channel saved without its address is refused at that field.
  const api = demoNotify();
  let said = $state("Nothing yet");
</script>

<div class="notify-card-demo">
  <NotifyCard
    {api}
    text={NOTIFY_TEXT}
    app={NOTIFY_APP}
    lang="en"
    providers={NOTIFY_PROVIDERS}
    events={NOTIFY_EVENTS}
    checks={NOTIFY_CHECKS}
    unavailable={NOTIFY_ELSEWHERE}
    notify={(m) => (said = m)}
  />
  <output data-hook="said">{said}</output>
</div>
