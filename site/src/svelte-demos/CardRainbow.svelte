<script lang="ts">
  import { Button, Card } from "@glimstone/svelte";

  const SECTIONS = ["Sources", "Targets", "Retention"];
</script>

<div style="display: grid; gap: 28px; width: 100%; max-width: 420px; padding-top: 12px">
  {#each SECTIONS as title, i (title)}
    <Card {title} hueIndex={i}>
      <Button label="Add" labelKey="add" tone="accent" />
    </Card>
  {/each}
</div>
