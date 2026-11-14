<script lang="ts">
  import { FortressPairing } from "@glimstone/svelte";
  import { fortressTextEn as text } from "@glimstone/core";
  import { HOME, household, PERMISSIONS } from "../fortressData";

  // The pairing settings: the one place to change the phrase or leave.
  let said = $state("Nothing yet");
  const answers = household(
    (what) => (said = what),
    () => PERMISSIONS,
    () => {},
  );
</script>

<div class="fortress-demo">
  <FortressPairing {text} lang="en" app={HOME} pairedWith={["Pocket"]} onLeave={answers.onLeave} onChangePhrase={answers.onChangePhrase} />
  <output data-hook="said">{said}</output>
</div>
