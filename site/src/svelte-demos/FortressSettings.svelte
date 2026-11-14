<script lang="ts">
  import { Badge, Button, Fortress, FortressPairing, InstanceCard } from "@glimstone/svelte";
  import { fortressTextEn as text, memberName } from "@glimstone/core";
  import { APPS, HOME, household, PERMISSIONS } from "../fortressData";

  // The fortress on a pairing page of its own: the card with the phrase, its
  // change and Leave at the top, then the other apps drawn with the app's own
  // card, and no second Show phrase in the corner. The code carries the
  // address of an own relay after the words. The app's card removes through
  // the fortress's own window.
  let said = $state("Nothing yet");
  let permissions = $state.raw(PERMISSIONS);
  const answers = household(
    (what) => (said = what),
    () => permissions,
    (next) => (permissions = next),
  );
</script>

<div class="fortress-demo">
  <FortressPairing
    {text}
    lang="en"
    app={HOME}
    pairedWith={["Pocket"]}
    phrasePassword
    phraseQr={(words) => `${words.join(" ")}\nhttps://relay.example`}
    onShowPhrase={answers.onShowPhrase}
    onChangePhrase={answers.onChangePhrase}
    onLeave={answers.onLeave}
    hueIndex={0}
  />
  <Fortress
    {text}
    lang="en"
    app={HOME}
    joined
    apps={APPS}
    {permissions}
    showOthers
    hueStart={1}
    onJoin={answers.onJoin}
    onPermission={answers.onPermission}
    onRemove={answers.onRemove}
  >
    {#snippet renderApp(app, hueIndex, remove)}
      <InstanceCard data-own-card={app.id} logo={app.logo} name={app.name} facts={app.instances.map((i) => i.device)} {hueIndex} actions={remove ? actions : undefined}>
        {#snippet badges()}<Badge tone="ok">{text.connected}</Badge>{/snippet}
      </InstanceCard>
      {#snippet actions()}
        <Button label={text.remove} labelKey="delete" tone="subtle" onClick={() => remove?.(app.instances[0]!.id, memberName(text, app, app.instances[0]!))} />
      {/snippet}
    {/snippet}
  </Fortress>
  <output data-hook="said">{said}</output>
</div>
