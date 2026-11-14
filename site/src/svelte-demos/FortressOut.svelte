<script lang="ts">
  import { Fortress, InstanceCard } from "@glimstone/svelte";
  import { fortressTextEn as text } from "@glimstone/core";
  import { APPS, HOME, household, instancesTab, PERMISSIONS } from "../fortressData";

  // Not in a fortress yet. The words in TWELVE join it, others are refused.
  let said = $state("Nothing yet");
  const answers = instancesTab(
    household(
      (what) => (said = what),
      () => PERMISSIONS,
      () => {},
    ),
  );
</script>

<div class="fortress-demo">
  <Fortress
    {text}
    lang="en"
    app={HOME}
    joined={false}
    apps={APPS}
    permissions={PERMISSIONS}
    pairedWith={["Pocket", "Studio"]}
    found={{ app: "Bravo", device: "Atlas", logo: APPS[0]!.logo }}
    hueStart={1}
    {...answers}
  >
    <InstanceCard logo={HOME.logo} name="Atlas" eyebrow={text.thisInstance} facts={["192.168.1.61:3443", "v10.5.3"]} hueIndex={0} />
  </Fortress>
  <output data-hook="said">{said}</output>
</div>
