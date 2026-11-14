<script lang="ts">
  import { Badge, Button, Fortress, InstanceCard } from "@glimstone/svelte";
  import { fortressTextEn as text, memberName } from "@glimstone/core";
  import { APPS, HOME, household, instancesTab, PERMISSIONS, remembering } from "../fortressData";

  // Inside a fortress: the phrase shows after "letmein", Echo's permission
  // refuses to switch, changing the phrase leaves Wanderer behind, and a removed
  // instance stays named under the switch until the phrase changes. Open says
  // what it would open.
  let said = $state("Nothing yet");
  let permissions = $state.raw(PERMISSIONS);
  let removed = $state.raw<string[]>([]);
  const answers = remembering(
    instancesTab(
      household(
        (what) => (said = what),
        () => permissions,
        (next) => (permissions = next),
      ),
    ),
    () => removed,
    (next) => (removed = next),
  );
</script>

<div class="fortress-demo">
  <Fortress
    {text}
    lang="en"
    app={HOME}
    joined
    apps={APPS}
    {permissions}
    phrasePassword
    pairedWith={["Pocket"]}
    hueStart={2}
    notify={(message, severity) => (said = `${severity}: ${message}`)}
    {removed}
    onOpen={(a, i) => (said = `Opened ${memberName(text, a, i)}`)}
    {...answers}
  >
    {#snippet children(remove)}
      <InstanceCard
        logo={HOME.logo}
        name="Atlas"
        eyebrow={text.thisInstance}
        facts={["192.168.1.61:3443", "v10.5.3"]}
        figures={[
          { value: "14 / 15", label: "Protected" },
          { value: "3 min ago", label: "Last backup" },
        ]}
        hueIndex={0}
      >
        {#snippet actions()}<Button label="Open" labelKey="open" />{/snippet}
      </InstanceCard>
      <InstanceCard data-instance="pocket" logo={HOME.logo} name="Pocket" eyebrow={text.forms.android} facts={["v10.5.3"]} hueIndex={1}>
        {#snippet badges()}<Badge>{text.viaRelay}</Badge><Badge tone="ok">{text.connected}</Badge>{/snippet}
        {#snippet actions()}<Button label={text.remove} labelKey="delete" onClick={() => remove("pocket", "Pocket")} />{/snippet}
      </InstanceCard>
    {/snippet}
  </Fortress>
  <output data-hook="said">{said}</output>
</div>
