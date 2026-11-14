<script lang="ts" module>
  import type { FileUploadText } from "@glimstone/core";

  export type { FileRefusal, FileUploadText } from "@glimstone/core";

  export interface FileUploadProps {
    label: string;
    /** The files, bound with `bind:value`. */
    value: File[];
    onChange?: (files: File[]) => void;
    /** The kinds of file it takes, as media types such as "image/*" or "application/json". */
    accept?: string[];
    maxFiles?: number;
    /** The largest file it takes, in bytes. */
    maxFileSize?: number;
    disabled?: boolean;
    text?: Partial<FileUploadText>;
  }
</script>

<script lang="ts">
  import * as fileUpload from "@zag-js/file-upload";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { FILE_UPLOAD_TEXT, formatFileSize, pageDir, type FileRefusal } from "@glimstone/core";
  import IconButton from "./IconButton.svelte";
  import { IconClose, IconUpload } from "./glyphs.js";

  // Files handed to the app by dropping them or from the picker, such as a
  // settings file to import. The drop zone is itself the button that opens the
  // picker, so there is one control and one stop for Tab. The files stand under
  // it as rows, and a refused one is named with its reason.
  let { label, value = $bindable(), onChange, accept, maxFiles = 1, maxFileSize, disabled = false, text }: FileUploadProps = $props();

  const words = $derived({ ...FILE_UPLOAD_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(fileUpload.machine, () => ({
    id,
    dir: pageDir(),
    acceptedFiles: value,
    accept: accept as fileUpload.Props["accept"],
    maxFiles,
    maxFileSize,
    disabled,
    onFileChange: (d: { acceptedFiles: File[] }) => {
      value = d.acceptedFiles;
      onChange?.(d.acceptedFiles);
    },
    translations: { dropzone: words.drop, deleteFile: (file: File) => words.remove(file.name) },
  }));
  const api = $derived(fileUpload.connect(service, normalizeProps));
</script>

<div data-glim="FileUpload" {...api.getRootProps()} class="glim-upload">
  <label {...api.getLabelProps()} class="glim-field-label">{label}</label>
  <div {...api.getDropzoneProps()} class="glim-upload-drop">
    {@render IconUpload()}
    <span class="glim-upload-words">{words.drop}</span>
  </div>
  <input {...api.getHiddenInputProps()} />
  {#if api.acceptedFiles.length > 0}
    <ul {...api.getItemGroupProps()} class="glim-upload-files">
      {#each api.acceptedFiles as file (`${file.name}-${file.size}`)}
        <li {...api.getItemProps({ file })} class="glim-upload-file">
          <span {...api.getItemNameProps({ file })} class="glim-upload-name">{file.name}</span>
          <span {...api.getItemSizeTextProps({ file })} class="glim-upload-size glim-num">{formatFileSize(file.size)}</span>
          <IconButton tip={words.remove(file.name)} glyph={IconClose} onclick={() => api.deleteFile(file)} />
        </li>
      {/each}
    </ul>
  {/if}
  {#each api.rejectedFiles as { file, errors } (`${file.name}-${file.size}`)}
    <p class="glim-field-error">{words.refused(file.name, errors[0] as FileRefusal)}</p>
  {/each}
</div>
