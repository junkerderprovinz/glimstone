import { createSignal } from "solid-js";
import { Button, Card, NumberField, SubCard, TextField, Toggle } from "@glimstone/solid";

const row = { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "16px" };
// Solid puts the literal keys of a style object in its template and the spread after them.
const end = { ...row, "justify-content": "flex-end" };

export default function SubCardBasic() {
  const [days, setDays] = createSignal<number | "">(14);
  const [prune, setPrune] = createSignal(true);
  return (
    <div style={{ width: "100%", "max-width": "440px", "padding-top": "12px" }}>
      <Card title="Snapshots">
        <SubCard title="Retention" hint="Older snapshots are removed after each run." end={<Toggle label="Prune" checked={prune()} onChange={setPrune} />}>
          <label style={row}>
            <span>Days to keep</span>
            <NumberField
              min={1}
              max={365}
              value={days()}
              onChange={(e) => setDays(e.currentTarget.value === "" ? "" : e.currentTarget.valueAsNumber)}
            />
          </label>
        </SubCard>
        <SubCard>
          <TextField label="A note" placeholder="A group needs no title" />
        </SubCard>
        <SubCard title="Commands">
          <div style={end}>
            <Button label="Copy command" labelKey="copy" tone="subtle" />
          </div>
        </SubCard>
      </Card>
    </div>
  );
}
