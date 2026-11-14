<script lang="ts">
  import { Card, Selector, SubCard } from "@glimstone/svelte";

  const PAGES = [
    { id: "all", label: "All pages" },
    { id: "current", label: "This page" },
    { id: "picked", label: "Picked pages" },
  ];

  let pages = $state("all");
</script>

<div style="width: 100%; max-width: 440px; padding-top: 12px">
  <Card title="Export">
    <SubCard title="Pages">
      <Selector label="Pages" orientation="vertical" items={PAGES} bind:value={pages} />
    </SubCard>
  </Card>
</div>
