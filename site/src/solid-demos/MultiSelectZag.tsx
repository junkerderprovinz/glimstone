import { createSignal } from "solid-js";
import { MultiSelect } from "@glimstone/solid/MultiSelect";

const KINDS = [
  "Photos", "Videos", "Music", "Documents", "Spreadsheets", "Presentations", "Archives", "Disk images",
  "E-books", "Fonts", "Subtitles", "Source code",
].map((k) => ({ value: k.toLowerCase().replace(/ /g, "-"), label: k }));

export default function MultiSelectZag() {
  const [kinds, setKinds] = createSignal(["photos"]);
  return (
    <div style={{ width: "320px" }}>
      <MultiSelect label="File kinds" options={KINDS} value={kinds()} onChange={setKinds} placeholder="Pick file kinds" />
    </div>
  );
}
