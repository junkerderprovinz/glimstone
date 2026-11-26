<script lang="ts">
  import { FileUpload } from "@glimstone/svelte/FileUpload";

  let files = $state<File[]>([]);

  // Stands in for an upload, so each row shows how far its file has gone.
  let sent = $state.raw(new Map<File, number>());
  $effect(() => {
    const chosen = files;
    const tick = setInterval(() => {
      if (chosen.every((file) => sent.get(file) === 1)) return;
      sent = new Map(chosen.map((file) => [file, Math.min(1, (sent.get(file) ?? 0) + 0.25)]));
    }, 200);
    return () => clearInterval(tick);
  });
  const progress = (file: File) => sent.get(file) ?? 0;
  const done = $derived(files.filter((f) => progress(f) >= 1).length);
</script>

<div style="width: min(30rem, 100%); display: grid; gap: 12px">
  <FileUpload label="Settings to import" bind:value={files} accept={["application/json"]} maxFiles={3} maxFileSize={1_000_000} {progress} />
  <span class="glim-num">{files.length === 0 ? "Nothing chosen yet" : `${done} of ${files.length} sent`}</span>
</div>
