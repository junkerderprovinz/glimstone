import { createMemo, createUniqueId, For, mergeProps, Show } from "solid-js";
import * as fileUpload from "@zag-js/file-upload";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { FILE_UPLOAD_TEXT, formatFileSize, pageDir, type FileRefusal, type FileUploadText } from "@glimstone/core";
import { IconButton } from "./IconButton.tsx";
import { IconClose, IconUpload } from "./glyphs.tsx";

export type { FileRefusal, FileUploadText } from "@glimstone/core";

// Files handed to the app by dropping them or from the picker, such as a
// settings file to import. The drop zone is itself the button that opens the
// picker, so there is one control and one stop for Tab. The files stand under
// it as rows, and a refused one is named with its reason.

export interface FileUploadProps {
  label: string;
  value: File[];
  onChange: (files: File[]) => void;
  /** The kinds of file it takes, as media types such as "image/*" or "application/json". */
  accept?: string[];
  maxFiles?: number;
  /** The largest file it takes, in bytes. */
  maxFileSize?: number;
  disabled?: boolean;
  text?: Partial<FileUploadText>;
}

export function FileUpload(raw: FileUploadProps) {
  const props = mergeProps({ maxFiles: 1, disabled: false }, raw);
  const id = createUniqueId();
  const words = () => ({ ...FILE_UPLOAD_TEXT, ...props.text });
  const service = useMachine(fileUpload.machine, () => ({
    id,
    dir: pageDir(),
    acceptedFiles: props.value,
    accept: props.accept as fileUpload.Props["accept"],
    maxFiles: props.maxFiles,
    maxFileSize: props.maxFileSize,
    disabled: props.disabled,
    onFileChange: (d: { acceptedFiles: File[] }) => props.onChange(d.acceptedFiles),
    translations: { dropzone: words().drop, deleteFile: (file: File) => words().remove(file.name) },
  }));
  const api = createMemo(() => fileUpload.connect(service, normalizeProps));
  return (
    <div data-glim="FileUpload" {...api().getRootProps()} class="glim-upload">
      <label {...api().getLabelProps()} class="glim-field-label">
        {props.label}
      </label>
      <div {...api().getDropzoneProps()} class="glim-upload-drop">
        <IconUpload />
        <span class="glim-upload-words">{words().drop}</span>
      </div>
      <input {...api().getHiddenInputProps()} />
      <Show when={api().acceptedFiles.length > 0}>
        <ul {...api().getItemGroupProps()} class="glim-upload-files">
          <For each={api().acceptedFiles}>
            {(file) => (
              <li {...api().getItemProps({ file })} class="glim-upload-file">
                <span {...api().getItemNameProps({ file })} class="glim-upload-name">
                  {file.name}
                </span>
                <span {...api().getItemSizeTextProps({ file })} class="glim-upload-size glim-num">
                  {formatFileSize(file.size)}
                </span>
                <IconButton tip={words().remove(file.name)} glyph={<IconClose />} onClick={() => api().deleteFile(file)} />
              </li>
            )}
          </For>
        </ul>
      </Show>
      <For each={api().rejectedFiles}>{({ file, errors }) => <p class="glim-field-error">{words().refused(file.name, errors[0] as FileRefusal)}</p>}</For>
    </div>
  );
}
