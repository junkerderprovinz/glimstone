<script setup lang="ts">
import { computed, onMounted, shallowRef, type Component } from "vue";
import { splitQuestion } from "@glimstone/core";
import Badge from "./Badge.vue";
import Button from "./Button.vue";
import { IconCancel, IconClose } from "./glyphs";

// The confirm surface for a destructive action (rule 15). It holds no state;
// useConfirm gives it the portal, Escape, the Tab trap and focus back to the
// control that asked. A switch or two the answer needs go in the `extra` slot.
const props = defineProps<{
  title: string;
  message: string;
  /** The words of the action being confirmed, so the answer repeats "Delete"
   *  rather than a bare "Confirm". */
  confirmLabel: string;
  /** Translation key behind confirmLabel, so the confirm button shows its glyph. */
  confirmLabelKey?: string;
  confirmGlyph?: Component;
  cancelLabel: string;
  /** A close button in the head, for a window that is more than a question. */
  closeLabel?: string;
}>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();
const split = computed(() => splitQuestion(props.message));
const card = shallowRef<HTMLDivElement | null>(null);
// Focus lands on Cancel, the answer that changes nothing.
const cancel = shallowRef<{ el: HTMLButtonElement | null } | null>(null);
onMounted(() => cancel.value?.el?.focus());
defineExpose({ card });
</script>

<template>
  <div class="glim-modal-backdrop" @click.self="emit('cancel')">
    <div
      data-glim="ConfirmDialog"
      :data-glim-title="title"
      ref="card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmdialog-title"
      aria-describedby="confirmdialog-message"
      class="glim-modal-card glim-window--small"
    >
      <div class="glim-modal-head">
        <h2 id="confirmdialog-title" class="glim-modal-title">
          <Badge tone="heading" size="heading" wrap>{{ title }}</Badge>
        </h2>
        <Button
          v-if="closeLabel !== undefined"
          :label="closeLabel"
          label-key="common.close"
          :glyph="IconClose"
          class="glim-modal-close"
          @click="emit('cancel')"
        />
      </div>
      <div class="glim-modal-body">
        <div id="confirmdialog-message">
          <p class="glim-modal-question">{{ split.question }}</p>
          <p v-if="split.detail" class="glim-modal-text">{{ split.detail }}</p>
        </div>
        <div v-if="$slots.extra" class="glim-modal-extra"><slot name="extra" /></div>
      </div>
      <div class="glim-modal-foot">
        <Button ref="cancel" :label="cancelLabel" label-key="common.cancel" :glyph="IconCancel" @click="emit('cancel')" />
        <!-- Not red ("Destructive and confirmable actions"): the dialog's
             sentence is the warning, and neither button is recommended. -->
        <Button :label="confirmLabel" :label-key="confirmLabelKey ?? null" :glyph="confirmGlyph" @click="emit('confirm')" />
      </div>
    </div>
  </div>
</template>
