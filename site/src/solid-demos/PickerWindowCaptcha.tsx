import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { CAPTCHA_TEXT, captchaLine, captchaPicker } from "../captchaData";
import { Glyph } from "../solid/glyph";

function CaptchaWindow(props: { onPick: (id: string) => void; onClose: () => void }) {
  const { items, groups } = captchaPicker((name) => <Glyph name={name} />);
  return (
    <PickerWindow
      title="Add a captcha solver"
      hint="A paid service that solves captchas before anyone is asked. Its API key comes next."
      items={items}
      groups={groups}
      text={CAPTCHA_TEXT}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

export default function PickerWindowCaptcha() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Add a solver" labelKey="add" onClick={() => setOpen(true)} />
      <output>{captchaLine(picked())}</output>
      <Show when={open()}>
        <CaptchaWindow
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
