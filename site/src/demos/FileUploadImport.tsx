import { useState } from "react";
import { FileUpload } from "@glimstone/react/FileUpload";

export default function FileUploadImport() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div style={{ width: "min(30rem, 100%)", display: "grid", gap: 12 }}>
      <FileUpload label="Settings to import" value={files} onChange={setFiles} accept={["application/json"]} maxFileSize={1_000_000} />
      <span className="glim-num">{files.length === 0 ? "Nothing chosen yet" : `Ready to import ${files[0]!.name}`}</span>
    </div>
  );
}
