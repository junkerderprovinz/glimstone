import { createSignal, For, Match, onCleanup, Show, Switch } from "solid-js";
import { Button, Card, EmptyState, IconButton, ListRow, Pill, SkeletonRow, TextField } from "@glimstone/solid";
import { Glyph } from "../../solid/glyph";

interface Backup {
  name: string;
  size: string;
  failed?: boolean;
}

export default function ListPage() {
  const [backups, setBackups] = createSignal<Backup[]>([
    { name: "appdata", size: "2.4 GB" },
    { name: "photos", size: "212 GB" },
    { name: "documents", size: "880 MB", failed: true },
  ]);
  const [filter, setFilter] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  let added = 0;
  const done = setTimeout(() => setLoading(false), 900);
  onCleanup(() => clearTimeout(done));
  const shown = () => backups().filter((b) => b.name.includes(filter().trim().toLowerCase()));
  const add = () => {
    added++;
    setBackups((list) => [...list, { name: `backup-${added}`, size: "0 B" }]);
    setFilter("");
  };
  return (
    <div style={{ display: "grid", gap: "28px", width: "100%", "max-width": "640px" }}>
      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "8px", "align-items": "center" }}>
        <TextField label="Filter" placeholder="Filter by name" width="grow" value={filter()} onInput={(e) => setFilter(e.currentTarget.value)} />
        <Button label="Add a backup" labelKey="add" tone="accent" size="key" onClick={add} />
      </div>
      <Card title="Backups">
        <Switch>
          <Match when={loading()}>
            <div role="group" aria-label="Backups" aria-busy="true">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          </Match>
          <Match when={shown().length > 0}>
            <div style={{ display: "grid", gap: "2px" }}>
              <For each={shown()}>
                {(b) => (
                  <ListRow
                    name={b.name}
                    tile={<Glyph name="IconArchive" />}
                    badges={
                      <>
                        <Pill class="glim-num">{b.size}</Pill>
                        <Show when={b.failed}>
                          <Pill tone="fail">Failed</Pill>
                        </Show>
                      </>
                    }
                    actions={
                      <IconButton
                        tip={`Delete ${b.name}`}
                        glyph={<Glyph name="IconTrash" />}
                        onClick={() => setBackups((list) => list.filter((x) => x !== b))}
                      />
                    }
                  />
                )}
              </For>
            </div>
          </Match>
          <Match when={backups().length > 0}>
            <EmptyState
              nested
              glyph={<Glyph name="IconFilter" />}
              title="No backups match the filter"
              action={<Button label="Clear the filter" labelKey={null} glyph={<Glyph name="IconClose" />} onClick={() => setFilter("")} />}
            />
          </Match>
          <Match when={true}>
            <EmptyState nested glyph={<Glyph name="IconArchive" />} title="No backups yet" hint="Add one, and the first run starts tonight." />
          </Match>
        </Switch>
      </Card>
    </div>
  );
}
