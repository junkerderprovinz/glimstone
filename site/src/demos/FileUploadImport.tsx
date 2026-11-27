import { useEffect, useState } from "react";
import { FileUpload } from "@glimstone/react/FileUpload";

// Stands in for an upload, so each row shows how far its file has gone.
function useFakeUpload(files: File[]) {
  const [sent, setSent] = useState(new Map<File, number>());
  useEffect(() => {
    const tick = setInterval(() => {
      setSent((before) => {
        if (files.every((file) => before.get(file) === 1)) return before;
        return new Map(files.map((file) => [file, Math.min(1, (before.get(file) ?? 0) + 0.25)]));
      });
    }, 200);
    return () => clearInterval(tick);
  }, [files]);
  return (file: File) => sent.get(file) ?? 0;
}

export default function FileUploadImport() {
  const [files, setFiles] = useState<File[]>([]);
  const progress = useFakeUpload(files);
  const done = files.filter((f) => progress(f) >= 1).length;
  return (
    <div style={{ width: "min(30rem, 100%)", display: "grid", gap: 12 }}>
      <FileUpload label="Settings to import" value={files} onChange={setFiles} accept={["application/json"]} maxFiles={3} maxFileSize={1_000_000} progress={progress} />
      <span className="glim-num">{files.length === 0 ? "Nothing chosen yet" : `${done} of ${files.length} sent`}</span>
    </div>
  );
}
