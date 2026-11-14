import { createSignal } from "solid-js";
import { Steps } from "@glimstone/solid/Steps";

const steps = [
  { title: "Kind", body: "Pick where the backups go: a folder, a server or a cloud." },
  { title: "Address", body: "Name the place, such as the share and the folder on it." },
  { title: "Check", body: "A first test writes a file there and reads it back." },
];

export default function StepsStorage() {
  const [finished, setFinished] = createSignal(false);
  return (
    <div style={{ width: "min(34rem, 100%)", display: "grid", gap: "12px" }}>
      <Steps items={steps} content={(s) => s.body} onFinish={() => setFinished(true)} />
      <span class="glim-num">{finished() ? "Storage location added" : "Not added yet"}</span>
    </div>
  );
}
