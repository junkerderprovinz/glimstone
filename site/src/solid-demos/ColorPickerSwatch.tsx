import { createSignal, Show } from "solid-js";
import { Button, ColorPicker, Window } from "@glimstone/solid";

function Swatch(props: { label: string }) {
  const [colour, setColour] = createSignal<{ hex: string; name: string | null }>({ hex: "#1b6b73", name: "Petrol" });
  const [anchor, setAnchor] = createSignal<HTMLElement | null>(null);
  return (
    <span class="demo-swatch-row">
      <button
        type="button"
        aria-label={props.label}
        class="demo-swatch"
        style={{ "background-color": colour().hex }}
        onClick={(e) => setAnchor(anchor() ? null : e.currentTarget)}
      />
      <span data-applied>
        {colour().name} {colour().hex}
      </span>
      <Show when={anchor()}>
        {(at) => <ColorPicker value={colour().hex} anchor={at()} onApply={(hex, name) => setColour({ hex, name })} onClose={() => setAnchor(null)} />}
      </Show>
    </span>
  );
}

export default function ColorPickerSwatch() {
  const [open, setOpen] = createSignal(false);
  return (
    <div style={{ display: "flex", gap: "16px", "align-items": "center", "flex-wrap": "wrap" }}>
      <Swatch label="Label colour" />
      <Button label="Open in a window" labelKey={null} onClick={() => setOpen(true)} />
      <Show when={open()}>
        <Window title="Label" text={{ cancel: "Cancel", close: "Close" }} onClose={() => setOpen(false)}>
          <Swatch label="Label colour in the window" />
        </Window>
      </Show>
    </div>
  );
}
