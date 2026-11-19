import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { DOWNLOAD_TEXT, downloadLine, downloadPicker } from "../downloadData";
import { Glyph } from "../solid/glyph";

function DownloadWindow(props: { onPick: (id: string) => void; onClose: () => void }) {
  const { items, groups } = downloadPicker((name) => <Glyph name={name} />);
  return (
    <PickerWindow
      title="Add an account"
      hint="Where the links are unlocked. Pick a debrid service or a hoster you have a login at."
      items={items}
      groups={groups}
      text={DOWNLOAD_TEXT}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

export default function PickerWindowDownload() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Add an account" labelKey="add" onClick={() => setOpen(true)} />
      <output>{downloadLine(picked())}</output>
      <Show when={open()}>
        <DownloadWindow
          onPick={(id) => {
            setOpen(false);
            setPicked(id);
          }}
          onClose={() => setOpen(false)}
        />
      </Show>
    </div>
  );
}
