<script lang="ts">
  import { FileUpload } from "@glimstone/svelte/FileUpload";

  let files = $state<File[]>([]);
</script>

<div style="width: min(30rem, 100%); display: grid; gap: 12px">
  <FileUpload label="Settings to import" bind:value={files} accept={["application/json"]} maxFileSize={1_000_000} />
  <span class="glim-num">{files.length === 0 ? "Nothing chosen yet" : `Ready to import ${files[0]!.name}`}</span>
</div>
