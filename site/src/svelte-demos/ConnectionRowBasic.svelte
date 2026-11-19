<script lang="ts">
  import { Badge, Card, ConnectionRow, type ConnectionTest } from "@glimstone/svelte";
  import { CONNECTION_TEXT, CONNECTIONS, mountAction, testConnection, toggleMount, type DemoConnection, type DemoMount } from "../connectionData";
  import { glyph } from "../svelte/glyph";

  let rows = $state(CONNECTIONS);
  let tests = $state<Record<string, ConnectionTest>>({});
  let mounts = $state<Record<string, DemoMount>>({});
  let said = $state("Nothing pressed yet");

  async function test(c: DemoConnection) {
    tests = { ...tests, [c.id]: { busy: true } };
    const found = await testConnection(c);
    tests = { ...tests, [c.id]: found };
  }
  async function mount(c: DemoConnection) {
    const mounted = mounts[c.id]?.mounted ?? false;
    mounts = { ...mounts, [c.id]: { mounted, busy: true } };
    const now = await toggleMount(mounted);
    mounts = { ...mounts, [c.id]: { mounted: now } };
  }
  function actions(c: DemoConnection) {
    if (!c.mountable) return undefined;
    const a = mountAction(mounts[c.id]);
    return [{ ...a, glyph: glyph(a.glyph), onClick: () => void mount(c) }];
  }
  function remove(c: DemoConnection) {
    rows = rows.filter((r) => r.id !== c.id);
    said = `Removed ${c.name}`;
  }
</script>

<div style="width: 100%; max-width: 1280px; padding-top: 12px">
  <Card title="Connections">
    {#each rows as c (c.id)}
      {#snippet badge()}<Badge tone="fail">{c.badge}</Badge>{/snippet}
      {#snippet more()}<span>{c.more}</span>{/snippet}
      <ConnectionRow
        name={c.name}
        mark={typeof c.mark === "string" ? glyph(c.mark) : c.mark}
        status={c.status}
        badges={c.badge ? badge : undefined}
        children={c.more ? more : undefined}
        test={tests[c.id]}
        actions={actions(c)}
        text={CONNECTION_TEXT}
        onTest={c.untested ? undefined : () => void test(c)}
        onEdit={() => (said = `Editing ${c.name}`)}
        onRemove={() => remove(c)}
      />
    {/each}
    <output>{said}</output>
  </Card>
</div>
