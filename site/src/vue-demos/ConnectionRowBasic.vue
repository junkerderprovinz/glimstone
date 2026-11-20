<script setup lang="ts">
import { ref } from "vue";
import { Badge, Card, ConnectionRow, type ConnectionTest } from "@glimstone/vue";
import { CONNECTION_TEXT, CONNECTIONS, mountAction, testConnection, toggleMount, type DemoConnection, type DemoMount } from "../connectionData";
import { glyph } from "../vue/glyph";

const rows = ref(CONNECTIONS);
const tests = ref<Record<string, ConnectionTest>>({});
const mounts = ref<Record<string, DemoMount>>({});
const said = ref("Nothing pressed yet");

async function test(c: DemoConnection) {
  tests.value = { ...tests.value, [c.id]: { busy: true } };
  const found = await testConnection(c);
  tests.value = { ...tests.value, [c.id]: found };
}
async function mount(c: DemoConnection) {
  const mounted = mounts.value[c.id]?.mounted ?? false;
  mounts.value = { ...mounts.value, [c.id]: { mounted, busy: true } };
  const now = await toggleMount(mounted);
  mounts.value = { ...mounts.value, [c.id]: { mounted: now } };
}
function actions(c: DemoConnection) {
  if (!c.mountable) return undefined;
  const a = mountAction(mounts.value[c.id]);
  return [{ ...a, glyph: glyph(a.glyph), onClick: () => void mount(c) }];
}
function remove(c: DemoConnection) {
  rows.value = rows.value.filter((r) => r.id !== c.id);
  said.value = `Removed ${c.name}`;
}
</script>

<template>
  <div style="width: 100%; max-width: 1280px; padding-top: 12px">
    <Card title="Connections">
      <ConnectionRow
        v-for="c in rows"
        :key="c.id"
        :name="c.name"
        :mark="typeof c.mark === 'string' ? glyph(c.mark) : c.mark"
        :status="c.status"
        :test="tests[c.id]"
        :actions="actions(c)"
        :text="CONNECTION_TEXT"
        :on-test="c.untested ? undefined : () => test(c)"
        @edit="said = `Editing ${c.name}`"
        @remove="remove(c)"
      >
        <template v-if="c.badge" #badges><Badge :tone="c.tone ?? 'fail'">{{ c.badge }}</Badge></template>
        <span v-if="c.more">{{ c.more }}</span>
      </ConnectionRow>
      <output>{{ said }}</output>
    </Card>
  </div>
</template>
