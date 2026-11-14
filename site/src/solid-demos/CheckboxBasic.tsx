import { createSignal } from "solid-js";
import { Checkbox } from "@glimstone/solid";

export default function CheckboxBasic() {
  const [again, setAgain] = createSignal(false);
  const [write, setWrite] = createSignal(true);
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <Checkbox label="Don't show again" checked={again()} onChange={setAgain} />
      <Checkbox label="Name, always shown" checked disabled onChange={() => {}} />
      <span style={{ display: "flex", gap: "8px", "align-items": "center" }}>
        Owner writes
        <Checkbox label="The owner may write" hideLabel checked={write()} onChange={setWrite} />
      </span>
    </div>
  );
}
