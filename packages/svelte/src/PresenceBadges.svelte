<script lang="ts" module>
  import type { FortressInstance, FortressText } from "@glimstone/core";

  export interface PresenceBadgesProps {
    instance: FortressInstance;
    text: FortressText;
  }
</script>

<script lang="ts">
  import { presenceTone } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import { presenceText } from "./fortressParts.js";

  // The state of one instance: reached through the relay, and connected, checking or away.
  let { instance, text }: PresenceBadgesProps = $props();
</script>

<span data-glim="PresenceBadges" style="display: contents">
  {#if instance.relay}<Badge>{text.viaRelay}</Badge>{/if}
  <Badge tone={presenceTone(instance.presence)}>{presenceText(text, instance)}</Badge>
</span>
