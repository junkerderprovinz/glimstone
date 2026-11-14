<script lang="ts">
  import { Accordion } from "@glimstone/svelte/Accordion";

  const questions = [
    { value: "where", title: "Where are the backups kept?", answer: "In the storage locations of the entry, the newest first." },
    { value: "how-long", title: "How long is a backup kept?", answer: "As long as the retention of its schedule says, thirty days unless it was changed." },
    { value: "restore", title: "Can a single file be restored?", answer: "Yes. Open the backup, pick the file and choose Restore." },
  ];
</script>

<div style="width: min(32rem, 100%)">
  <Accordion items={questions}>
    {#snippet content(q)}{q.answer}{/snippet}
  </Accordion>
</div>
