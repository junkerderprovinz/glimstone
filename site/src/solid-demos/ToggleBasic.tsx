import { createSignal } from "solid-js";
import { Toggle } from "@glimstone/solid";

export default function ToggleBasic() {
  const [quiet, setQuiet] = createSignal(true);
  const [sound, setSound] = createSignal(false);
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <Toggle id="quiet-notifications" data-hook="quiet" class="demo-toggle" label="Quiet notifications" checked={quiet()} onChange={setQuiet} />
      <Toggle label="Play a sound" checked={sound()} onChange={setSound} disabled={!quiet()} />
    </div>
  );
}
