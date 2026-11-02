<script setup lang="ts">
import { defineComponent, h, ref } from "vue";
import { Button, Toggle, useConfirm } from "@glimstone/vue";

const { confirm, ConfirmHost } = useConfirm({ title: "Confirm", cancel: "Cancel", confirm: "Confirm" });
const alsoFiles = ref(false);

// The switch the answer needs, handed to the dialog as a component.
const AlsoFiles = defineComponent(() => () =>
  h(Toggle, {
    label: "Also delete the files on the target",
    modelValue: alsoFiles.value,
    "onUpdate:modelValue": (on: boolean) => (alsoFiles.value = on),
  }),
);

async function remove() {
  alsoFiles.value = false;
  const yes = await confirm("Delete the snapshot from 14 October? The archive on the target stays.", {
    confirmLabel: "Delete",
    confirmLabelKey: "delete",
    extra: AlsoFiles,
  });
  if (yes) console.info(alsoFiles.value ? "snapshot and files deleted" : "snapshot deleted");
}
</script>

<template>
  <Button label="Delete snapshot" label-key="delete" @click="remove" />
  <ConfirmHost />
</template>
