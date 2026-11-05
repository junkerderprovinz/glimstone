import { useState } from "react";
import { TextArea, TextField } from "@glimstone/react";

export default function TextFieldBasic() {
  const [name, setName] = useState("backup-weekly");
  const [notes, setNotes] = useState("");
  return (
    <div data-column style={{ display: "grid", gap: 8, width: 400, justifyItems: "start" }}>
      <TextField label="Job name" width="wide" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="Group" width="medium" placeholder="None" />
      <TextField label="Port" width="short" mono defaultValue="8080" maxLength={5} data-hook="port" />
      <TextField label="Address" mono placeholder="smb://server/share" />
      <TextArea label="Notes" rows={3} placeholder="What this job is for" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <output>{name}</output>
    </div>
  );
}
