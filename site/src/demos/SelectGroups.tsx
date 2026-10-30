import { useState } from "react";
import { Select } from "@gs/react/Select";
import { Glyph } from "../glyph";

export default function SelectGroups() {
  const [format, setFormat] = useState("opus");
  const [target, setTarget] = useState("local");
  return (
    <div style={{ display: "grid", gap: 16, width: 260 }}>
      <Select
        label="Audio format"
        value={format}
        onChange={setFormat}
        groups={[
          { entries: [{ value: "best", label: "Auto" }] },
          {
            entries: [
              { value: "opus", label: "Opus" },
              { value: "aac", label: "AAC (M4A)" },
              { value: "mp3", label: "MP3" },
            ],
          },
          {
            heading: "Convert to",
            entries: [
              { value: "flac", label: "FLAC" },
              { value: "wav", label: "WAV" },
            ],
          },
        ]}
      />
      <Select
        label="Save to"
        value={target}
        onChange={setTarget}
        options={[
          { value: "local", label: "This server", glyph: <Glyph name="IconFolder" /> },
          { value: "cloud", label: "Cloud storage", glyph: <Glyph name="IconCloud" /> },
          { value: "share", label: "Network share", glyph: <Glyph name="IconFolderOpen" />, disabled: true },
        ]}
      />
    </div>
  );
}
