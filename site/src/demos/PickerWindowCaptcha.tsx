import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { CAPTCHA_TEXT, captchaLine, captchaPicker } from "../captchaData";
import { Glyph } from "../glyph";

const { items, groups } = captchaPicker((name) => <Glyph name={name} />);

export default function PickerWindowCaptcha() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Add a solver" labelKey="add" onClick={() => setOpen(true)} />
      <output>{captchaLine(picked)}</output>
      {open && (
        <PickerWindow
          title="Add a captcha solver"
          hint="A paid service that solves captchas before anyone is asked. Its API key comes next."
          items={items}
          groups={groups}
          text={CAPTCHA_TEXT}
          onPick={(id) => {
            setOpen(false);
            setPicked(id);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
