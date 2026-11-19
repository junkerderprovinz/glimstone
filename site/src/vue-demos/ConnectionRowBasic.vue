<script setup lang="ts">
import { ref } from "vue";
import { Badge, Card, ConnectionRow, type ConnectionTest } from "@glimstone/vue";
import { CONNECTION_TEXT, CONNECTIONS, testConnection, type DemoConnection } from "../connectionData";
import { glyph } from "../vue/glyph";

const rows = ref(CONNECTIONS);
const tests = ref<Record<string, ConnectionTest>>({});
const said = ref("Nothing pressed yet");

async function test(c: DemoConnection) {
  tests.value = { ...tests.value, [c.id]: { busy: true } };
  const found = await testConnection(c);
  tests.value = { ...tests.value, [c.id]: found };
}
function remove(c: DemoConnection) {
  rows.value = rows.value.filter((r) => r.id !== c.id);
  said.value = `Removed ${c.name}`;
}
</script>

<template>
  <div style="width: 100%; max-width: 640px; padding-top: 12px">
    <Card title="Connections">
      <ConnectionRow
        v-for="c in rows"
        :key="c.id"
        :name="c.name"
        :mark="typeof c.mark === 'string' ? glyph(c.mark) : c.mark"
        :status="c.status"
        :test="tests[c.id]"
        :text="CONNECTION_TEXT"
        :on-test="c.untested ? undefined : () => test(c)"
        @edit="said = `Editing ${c.name}`"
        @remove="remove(c)"
      >
        <template v-if="c.badge" #badges><Badge tone="fail">{{ c.badge }}</Badge></template>
        <span v-if="c.more">{{ c.more }}</span>
      </ConnectionRow>
      <output>{{ said }}</output>
    </Card>
  </div>
</template>
