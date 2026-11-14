import { Button, Kbd } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

export default function ButtonRow() {
  return (
    <div style={{ display: "grid", gap: "12px", "justify-items": "start", "grid-template-columns": "minmax(0, 1fr)", width: "460px" }}>
      <div data-tight style={{ display: "flex", "align-items": "center", gap: "8px", width: "100%" }}>
        <span style={{ flex: "1 1 auto", "min-width": "0", "white-space": "nowrap", overflow: "hidden", "text-overflow": "ellipsis" }}>
          1,204 files moved to the trash on the server
        </span>
        <Button label="Put all 1,204 of them back where they were" labelKey={null} />
      </div>
      <Button label="Release page" labelKey={null} glyph={<Glyph name="IconApply" />} href="#/guide/palette" />
      <Button label="Closed page" labelKey={null} glyph={<Glyph name="IconApply" />} href="#/guide/palette" disabled />
      <Button
        label="Changes"
        labelKey={null}
        before={<span data-slot="before">3</span>}
        after={
          <span data-slot="after">
            <Kbd>Ctrl+S</Kbd>
          </span>
        }
      />
    </div>
  );
}
