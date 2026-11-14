import { createSignal } from "solid-js";
import { TextArea, TextField } from "@glimstone/solid";

export default function TextFieldBasic() {
  const [name, setName] = createSignal("backup-weekly");
  const [notes, setNotes] = createSignal("");
  return (
    <div data-column style={{ display: "grid", gap: "8px", width: "400px", "justify-items": "start" }}>
      <TextField label="Job name" width="wide" value={name()} onInput={(e) => setName(e.currentTarget.value)} />
      <TextField label="Group" width="medium" placeholder="None" />
      <TextField label="Port" width="short" mono value="8080" maxlength={5} data-hook="port" />
      <TextField label="Address" mono placeholder="smb://server/share" />
      <TextArea label="Notes" rows={3} placeholder="What this job is for" value={notes()} onInput={(e) => setNotes(e.currentTarget.value)} />
      <output>{name()}</output>
    </div>
  );
}
