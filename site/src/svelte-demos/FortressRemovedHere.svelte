<script lang="ts">
  import { Fortress, InstanceCard } from "@glimstone/svelte";
  import { fortressTextEn as text } from "@glimstone/core";
  import { APPS, HOME, household, instancesTab, PERMISSIONS } from "../fortressData";

  // Another member removed Alpha, so the empty place says so until it joins again.
  const answers = instancesTab(
    household(
      () => {},
      () => PERMISSIONS,
      () => {},
    ),
  );
</script>

<div class="fortress-demo">
  <Fortress {text} lang="en" app={HOME} joined={false} removedHere apps={APPS} permissions={PERMISSIONS} hueStart={1} {...answers}>
    <InstanceCard logo={HOME.logo} name="Atlas" eyebrow={text.thisInstance} facts={["v10.5.3"]} hueIndex={0} />
  </Fortress>
</div>
