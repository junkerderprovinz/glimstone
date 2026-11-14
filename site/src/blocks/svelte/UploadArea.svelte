<script lang="ts">
  import { Button, Card, ListRow, Pill, ProgressBar } from "@glimstone/svelte";
  import { glyph } from "../../svelte/glyph";

  interface Upload {
    id: number;
    name: string;
    size: number;
    sent: number;
  }

  const megabytes = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

  // The upload itself is simulated: each file gains a slice every tick.
  let input: HTMLInputElement;
  let over = $state(false);
  let uploads = $state.raw<Upload[]>([{ id: -1, name: "holiday.mkv", size: 48e6, sent: 48e6 }]);
  let next = 0;

  const busy = $derived(uploads.some((u) => u.sent < u.size));
  $effect(() => {
    if (!busy) return;
    const tick = setInterval(() => (uploads = uploads.map((u) => ({ ...u, sent: Math.min(u.size, u.sent + u.size / 12) }))), 250);
    return () => clearInterval(tick);
  });

  function take(files: FileList | null | undefined) {
    if (!files?.length) return;
    const added = [...files].map((f) => ({ id: next++, name: f.name, size: Math.max(f.size, 1), sent: 0 }));
    uploads = [...added, ...uploads];
  }
  function drop(e: DragEvent) {
    e.preventDefault();
    over = false;
    take(e.dataTransfer?.files);
  }
  const file = glyph("IconFile");
</script>

<div style="width: 100%; max-width: 560px; padding-top: 12px">
  <Card title="Upload">
    <div
      class="glim-well"
      role="region"
      aria-label="Drop files here"
      data-over={over || undefined}
      style:display="grid"
      style:justify-items="center"
      style:gap="12px"
      style:padding="32px 16px"
      style:text-align="center"
      style:background={over ? "var(--accent-soft)" : undefined}
      style:color="var(--carbon-text-sub)"
      ondragover={(e) => {
        e.preventDefault();
        over = true;
      }}
      ondragleave={() => (over = false)}
      ondrop={drop}
    >
      <span style:color={over ? "var(--accent-ink)" : "var(--carbon-text-muted)"}>
        {@render glyph("IconUpload", 32)()}
      </span>
      <span>Drop files here, or choose them</span>
      <Button label="Choose files" labelKey="upload" onClick={() => input.click()} />
      <input bind:this={input} type="file" multiple hidden onchange={(e) => take(e.currentTarget.files)} />
    </div>
    <div style="display: grid; gap: 2px; margin-top: 16px">
      {#each uploads as u (u.id)}
        {#if u.sent < u.size}
          <div style="display: grid; gap: 6px; padding: 8px 12px">
            <span style="font-size: 14px">{u.name}</span>
            <ProgressBar value={u.sent / u.size} label={u.name} valueText={`${megabytes(u.sent)} of ${megabytes(u.size)}`} />
          </div>
        {:else}
          {#snippet size()}<Pill class="glim-num">{megabytes(u.size)}</Pill>{/snippet}
          <ListRow name={u.name} tile={file} badges={size} />
        {/if}
      {/each}
    </div>
  </Card>
</div>
