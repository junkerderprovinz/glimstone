import { useState } from "react";
import { MultiSelect } from "@glimstone/react/MultiSelect";

const KINDS = [
  "Photos", "Videos", "Music", "Documents", "Spreadsheets", "Presentations", "Archives", "Disk images",
  "E-books", "Fonts", "Subtitles", "Source code",
].map((k) => ({ value: k.toLowerCase().replace(/ /g, "-"), label: k }));

export default function MultiSelectZag() {
  const [kinds, setKinds] = useState(["photos"]);
  return (
    <div style={{ width: 320 }}>
      <MultiSelect label="File kinds" options={KINDS} value={kinds} onChange={setKinds} placeholder="Pick file kinds" />
    </div>
  );
}
