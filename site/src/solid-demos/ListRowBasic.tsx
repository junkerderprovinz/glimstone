import { createSignal } from "solid-js";
import { IconButton, ListRow, Pill } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

export default function ListRowBasic() {
  const [opened, setOpened] = createSignal(0);
  const buttons = () => (
    <>
      <IconButton tip="Edit" glyph={<Glyph name="IconPencil" />} />
      <IconButton tip="Delete" glyph={<Glyph name="IconTrash" />} />
    </>
  );
  return (
    <div style={{ display: "grid", gap: "2px", width: "100%", "max-width": "560px" }}>
      <ListRow
        name="nightly-backup"
        tip="Runs at three in the morning."
        onClick={() => setOpened((n) => n + 1)}
        tile={<Glyph name="IconFolder" />}
        badges={
          <>
            <Pill class="glim-num">2.4 GB</Pill>
            <Pill tone="ok">Settled</Pill>
          </>
        }
        actions={buttons()}
      />
      <ListRow name="archive-copy" tile={<Glyph name="IconCloud" />} badges={<Pill class="glim-num">880 MB</Pill>} actions={buttons()} />
      <ListRow
        name="/mnt/user/media/series/a-very-long-name-that-does-not-fit-beside-its-badges-and-its-buttons-in-one-row/season-01"
        mono
        tile={<Glyph name="IconFolder" />}
        badges={<Pill class="glim-num">12 GB</Pill>}
        actions={buttons()}
      />
      <output>Opened {opened()}</output>
    </div>
  );
}
