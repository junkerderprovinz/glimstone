<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { Button, Card, ListRow, Pill, ProgressBar } from "@glimstone/vue";
import { Glyph } from "../../vue/glyph";

interface Upload {
  id: number;
  name: string;
  size: number;
  sent: number;
}

const megabytes = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

// The upload itself is simulated: each file gains a slice every tick.
const input = ref<HTMLInputElement>();
const over = ref(false);
const uploads = ref<Upload[]>([{ id: -1, name: "holiday.mkv", size: 48e6, sent: 48e6 }]);
let next = 0;

const busy = computed(() => uploads.value.some((u) => u.sent < u.size));
let tick: ReturnType<typeof setInterval> | undefined;
watch(busy, (on) => {
  clearInterval(tick);
  if (on) tick = setInterval(() => (uploads.value = uploads.value.map((u) => ({ ...u, sent: Math.min(u.size, u.sent + u.size / 12) }))), 250);
});
onUnmounted(() => clearInterval(tick));

function take(files: FileList | null | undefined) {
  if (!files?.length) return;
  const added = [...files].map((f) => ({ id: next++, name: f.name, size: Math.max(f.size, 1), sent: 0 }));
  uploads.value = [...added, ...uploads.value];
}
function drop(e: DragEvent) {
  over.value = false;
  take(e.dataTransfer?.files);
}
</script>

<template>
  <div style="width: 100%; max-width: 560px; padding-top: 12px">
    <Card title="Upload">
      <div
        class="glim-well"
        :data-over="over || undefined"
        :style="{
          display: 'grid',
          justifyItems: 'center',
          gap: '12px',
          padding: '32px 16px',
          textAlign: 'center',
          background: over ? 'var(--accent-soft)' : undefined,
          color: 'var(--carbon-text-sub)',
        }"
        @dragover.prevent="over = true"
        @dragleave="over = false"
        @drop.prevent="drop"
      >
        <span :style="{ color: over ? 'var(--accent-ink)' : 'var(--carbon-text-muted)' }">
          <Glyph name="IconUpload" :size="32" />
        </span>
        <span>Drop files here, or choose them</span>
        <Button label="Choose files" label-key="upload" @click="input?.click()" />
        <input ref="input" type="file" multiple hidden @change="take(($event.target as HTMLInputElement).files)" />
      </div>
      <div style="display: grid; gap: 2px; margin-top: 16px">
        <template v-for="u in uploads" :key="u.id">
          <div v-if="u.sent < u.size" style="display: grid; gap: 6px; padding: 8px 12px">
            <span style="font-size: 14px">{{ u.name }}</span>
            <ProgressBar :value="u.sent / u.size" :label="u.name" :value-text="`${megabytes(u.sent)} of ${megabytes(u.size)}`" />
          </div>
          <ListRow v-else :name="u.name">
            <template #tile><Glyph name="IconFile" /></template>
            <template #badges><Pill class="glim-num">{{ megabytes(u.size) }}</Pill></template>
          </ListRow>
        </template>
      </div>
    </Card>
  </div>
</template>
