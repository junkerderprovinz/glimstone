import { useState } from "react";
import { Steps } from "@glimstone/react/Steps";

const steps = [
  { title: "Kind", body: "Pick where the backups go: a folder, a server or a cloud." },
  { title: "Address", body: "Name the place, such as the share and the folder on it." },
  { title: "Check", body: "A first test writes a file there and reads it back." },
];

export default function StepsStorage() {
  const [finished, setFinished] = useState(false);
  return (
    <div style={{ width: "min(34rem, 100%)", display: "grid", gap: 12 }}>
      <Steps items={steps} content={(s) => s.body} onFinish={() => setFinished(true)} />
      <span className="glim-num">{finished ? "Storage location added" : "Not added yet"}</span>
    </div>
  );
}
