<script lang="ts">
  import { Carousel } from "@glimstone/svelte/Carousel";

  const shots = [
    { title: "The new overview", body: "Every place a backup goes, at a glance." },
    { title: "Pairing a phone", body: "Twelve words, typed once." },
    { title: "Restoring one file", body: "Open the backup, pick the file, done." },
  ];
</script>

<div style="width: min(30rem, 100%)">
  <Carousel label="What is new" items={shots}>
    {#snippet slide(s)}
      <div class="glim-well" style="height: 140px; display: grid; align-content: center; gap: 4px; padding: 20px">
        <strong>{s.title}</strong>
        <span>{s.body}</span>
      </div>
    {/snippet}
  </Carousel>
</div>
