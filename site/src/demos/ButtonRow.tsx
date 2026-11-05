import { Button, Kbd } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function ButtonRow() {
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start", gridTemplateColumns: "minmax(0, 1fr)", width: 460 }}>
      <div data-tight style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
        <span style={{ flex: "1 1 auto", minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
