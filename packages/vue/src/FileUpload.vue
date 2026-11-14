<script setup lang="ts">
import { computed, useId } from "vue";
import * as fileUpload from "@zag-js/file-upload";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { FILE_UPLOAD_TEXT, formatFileSize, pageDir, type FileRefusal, type FileUploadText } from "@glimstone/core";
import IconButton from "./IconButton.vue";
import { IconClose, IconUpload } from "./glyphs";

// Files handed to the app by dropping them or from the picker, bound with
// v-model, such as a settings file to import. The drop zone is itself the
// button that opens the picker, so there is one control and one stop for Tab.
// The files stand under it as rows, and a refused one is named with its reason.
const props = withDefaults(
  defineProps<{
    label: string;
    /** The kinds of file it takes, as media types such as "image/*" or "application/json". */
    accept?: string[];
    maxFiles?: number;
    /** The largest file it takes, in bytes. */
    maxFileSize?: number;
    disabled?: boolean;
    text?: Partial<FileUploadText>;
  }>(),
  { maxFiles: 1, disabled: false },
);
const value = defineModel<File[]>({ required: true });

const words = computed(() => ({ ...FILE_UPLOAD_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  fileUpload.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    acceptedFiles: value.value,
    accept: props.accept as fileUpload.Props["accept"],
    maxFiles: props.maxFiles,
    maxFileSize: props.maxFileSize,
    disabled: props.disabled,
    onFileChange: (d: { acceptedFiles: File[] }) => (value.value = d.acceptedFiles),
    translations: { dropzone: words.value.drop, deleteFile: (file: File) => words.value.remove(file.name) },
  })),
);
const api = computed(() => fileUpload.connect(service, normalizeProps));
</script>

<template>
  <div data-glim="FileUpload" v-bind="api.getRootProps()" class="glim-upload">
    <label v-bind="api.getLabelProps()" class="glim-field-label">{{ label }}</label>
    <div v-bind="api.getDropzoneProps()" class="glim-upload-drop">
      <IconUpload />
      <span class="glim-upload-words">{{ words.drop }}</span>
    </div>
    <input v-bind="api.getHiddenInputProps()" />
    <ul v-if="api.acceptedFiles.length > 0" v-bind="api.getItemGroupProps()" class="glim-upload-files">
      <li v-for="file in api.acceptedFiles" :key="`${file.name}-${file.size}`" v-bind="api.getItemProps({ file })" class="glim-upload-file">
        <span v-bind="api.getItemNameProps({ file })" class="glim-upload-name">{{ file.name }}</span>
        <span v-bind="api.getItemSizeTextProps({ file })" class="glim-upload-size glim-num">{{ formatFileSize(file.size) }}</span>
        <IconButton :tip="words.remove(file.name)" :glyph="IconClose" @click="api.deleteFile(file)" />
      </li>
    </ul>
    <p v-for="{ file, errors } in api.rejectedFiles" :key="`${file.name}-${file.size}`" class="glim-field-error">
      {{ words.refused(file.name, errors[0] as FileRefusal) }}
    </p>
  </div>
</template>
