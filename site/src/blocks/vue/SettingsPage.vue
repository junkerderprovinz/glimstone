<script setup lang="ts">
import { ref } from "vue";
import { Card, FieldRow, FieldRowGroup, Selector, TextField, Toggle } from "@glimstone/vue";
import { oledRefusal } from "@glimstone/core";
import { glyph } from "../../vue/glyph";

const PAGES = [
  { id: "general", label: "General", glyph: glyph("IconTabGeneral") },
  { id: "look", label: "Look", glyph: glyph("IconTabLook") },
  { id: "notifications", label: "Notifications", glyph: glyph("IconNotifications") },
];

const THEMES = [
  { id: "dark", label: "Dark", glyph: glyph("IconMoon") },
  { id: "light", label: "Light", glyph: glyph("IconSun") },
  { id: "system", label: "System", glyph: glyph("IconThemeSystem") },
];

const CHANNELS = [
  { id: "stable", label: "Stable" },
  { id: "beta", label: "Beta" },
];

// Every change takes effect as it is made, so the page has no Save button.
const page = ref("general");
const name = ref("Atlas");
const autostart = ref(true);
const updates = ref(true);
const channel = ref("stable");
const theme = ref("system");
const oled = ref(false);
const failures = ref(true);
const weekly = ref(false);
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px; width: 100%; min-height: 360px">
    <Selector v-model="page" label="Settings pages" orientation="vertical" :items="PAGES" />
    <div style="flex: 1 1 20rem; min-width: 0; display: grid; align-content: start; gap: 40px; padding-top: 12px">
      <template v-if="page === 'general'">
        <Card title="General">
          <FieldRowGroup>
            <FieldRow label="Name">
              <TextField v-model="name" width="grow" :error="name.trim() ? undefined : 'The instance needs a name'" />
            </FieldRow>
            <FieldRow label="Start with the system">
              <Toggle v-model="autostart" />
            </FieldRow>
          </FieldRowGroup>
        </Card>
        <Card title="Updates">
          <FieldRowGroup>
            <FieldRow label="Look for updates">
              <Toggle v-model="updates" />
            </FieldRow>
            <FieldRow label="Channel">
              <Selector v-model="channel" inline :items="CHANNELS" :disabled="!updates" />
            </FieldRow>
          </FieldRowGroup>
        </Card>
      </template>
      <Card v-else-if="page === 'look'" title="Look">
        <FieldRowGroup>
          <FieldRow label="Theme">
            <Selector v-model="theme" inline :items="THEMES" />
          </FieldRow>
          <FieldRow label="OLED" hint="True black for OLED and AMOLED screens, whenever the dark look is showing.">
            <Toggle v-model="oled" :refused="oledRefusal(theme)" />
          </FieldRow>
        </FieldRowGroup>
      </Card>
      <Card v-else title="Notifications">
        <FieldRowGroup>
          <FieldRow label="When a backup fails">
            <Toggle v-model="failures" />
          </FieldRow>
          <FieldRow label="A summary every week">
            <Toggle v-model="weekly" />
          </FieldRow>
        </FieldRowGroup>
      </Card>
    </div>
  </div>
</template>
