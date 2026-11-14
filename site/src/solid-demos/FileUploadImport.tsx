import { createSignal } from "solid-js";
import { FileUpload } from "@glimstone/solid/FileUpload";

export default function FileUploadImport() {
  const [files, setFiles] = createSignal<File[]>([]);
  return (
    <div style={{ width: "min(30rem, 100%)", display: "grid", gap: "12px" }}>
      <FileUpload label="Settings to import" value={files()} onChange={setFiles} accept={["application/json"]} maxFileSize={1_000_000} />
      <span class="glim-num">{files().length === 0 ? "Nothing chosen yet" : `Ready to import ${files()[0]!.name}`}</span>
    </div>
  );
}
