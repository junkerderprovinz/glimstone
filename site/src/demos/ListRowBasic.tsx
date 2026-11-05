import { useState } from "react";
import { IconButton, ListRow, Pill } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function ListRowBasic() {
  const [opened, setOpened] = useState(0);
  const buttons = (
    <>
      <IconButton tip="Edit" glyph={<Glyph name="IconPencil" />} />
      <IconButton tip="Delete" glyph={<Glyph name="IconTrash" />} />
    </>
  );
  return (
    <div style={{ display: "grid", gap: 2, width: "100%", maxWidth: 560 }}>
      <ListRow
        name="nightly-backup"
        tip="Runs at three in the morning."
        onClick={() => setOpened((n) => n + 1)}
        tile={<Glyph name="IconFolder" />}
        badges={
          <>
            <Pill className="glim-num">2.4 GB</Pill>
            <Pill tone="ok">Settled</Pill>
          </>
        }
        actions={buttons}
      />
      <ListRow name="archive-copy" tile={<Glyph name="IconCloud" />} badges={<Pill className="glim-num">880 MB</Pill>} actions={buttons} />
      <ListRow
        name="/mnt/user/media/series/a-very-long-name-that-does-not-fit-beside-its-badges-and-its-buttons-in-one-row/season-01"
        mono
        tile={<Glyph name="IconFolder" />}
        badges={<Pill className="glim-num">12 GB</Pill>}
        actions={buttons}
      />
      <output>Opened {opened}</output>
    </div>
  );
}
