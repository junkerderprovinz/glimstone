import { createEffect, createSignal, onCleanup } from "solid-js";
import { FileUpload } from "@glimstone/solid/FileUpload";

// Stands in for an upload, so each row shows how far its file has gone.
function useFakeUpload(files: () => File[]) {
  const [sent, setSent] = createSignal(new Map<File, number>());
  createEffect(() => {
    const now = files();
    const tick = setInterval(() => {
      setSent((before) => {
        if (now.every((file) => before.get(file) === 1)) return before;
        return new Map(now.map((file) => [file, Math.min(1, (before.get(file) ?? 0) + 0.25)]));
      });
    }, 200);
    onCleanup(() => clearInterval(tick));
  });
  return (file: File) => sent().get(file) ?? 0;
}

export default function FileUploadImport() {
  const [files, setFiles] = createSignal<File[]>([]);
  const progress = useFakeUpload(files);
  const done = () => files().filter((f) => progress(f) >= 1).length;
  return (
    <div style={{ width: "min(30rem, 100%)", display: "grid", gap: "12px" }}>
      <FileUpload label="Settings to import" value={files()} onChange={setFiles} accept={["application/json"]} maxFiles={3} maxFileSize={1_000_000} progress={progress} />
      <span class="glim-num">{files().length === 0 ? "Nothing chosen yet" : `${done()} of ${files().length} sent`}</span>
    </div>
  );
}
