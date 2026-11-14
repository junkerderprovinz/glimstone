import { useId } from "react";
import * as fileUpload from "@zag-js/file-upload";
import { normalizeProps, useMachine } from "@zag-js/react";
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

export function FileUpload({ label, value, onChange, accept, maxFiles = 1, maxFileSize, disabled = false, text }: FileUploadProps) {
  const words = { ...FILE_UPLOAD_TEXT, ...text };
  const service = useMachine(fileUpload.machine, {
    id: useId(),
    dir: pageDir(),
    acceptedFiles: value,
    accept: accept as fileUpload.Props["accept"],
    maxFiles,
    maxFileSize,
    disabled,
    onFileChange: (d) => onChange(d.acceptedFiles),
    translations: { dropzone: words.drop, deleteFile: (file) => words.remove(file.name) },
  });
  const api = fileUpload.connect(service, normalizeProps);
  return (
    <div data-glim="FileUpload" {...api.getRootProps()} className="glim-upload">
      <label {...api.getLabelProps()} className="glim-field-label">
        {label}
      </label>
      <div {...api.getDropzoneProps()} className="glim-upload-drop">
        <IconUpload />
        <span className="glim-upload-words">{words.drop}</span>
      </div>
      <input {...api.getHiddenInputProps()} />
      {api.acceptedFiles.length > 0 && (
        <ul {...api.getItemGroupProps()} className="glim-upload-files">
          {api.acceptedFiles.map((file) => (
            <li key={`${file.name}-${file.size}`} {...api.getItemProps({ file })} className="glim-upload-file">
              <span {...api.getItemNameProps({ file })} className="glim-upload-name">
                {file.name}
              </span>
              <span {...api.getItemSizeTextProps({ file })} className="glim-upload-size glim-num">
                {formatFileSize(file.size)}
              </span>
              <IconButton tip={words.remove(file.name)} glyph={<IconClose />} onClick={() => api.deleteFile(file)} />
            </li>
          ))}
        </ul>
      )}
      {api.rejectedFiles.map(({ file, errors }) => (
        <p key={`${file.name}-${file.size}`} className="glim-field-error">
          {words.refused(file.name, errors[0] as FileRefusal)}
        </p>
      ))}
    </div>
  );
}
