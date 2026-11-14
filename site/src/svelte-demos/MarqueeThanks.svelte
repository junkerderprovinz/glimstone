<script lang="ts">
  import { Marquee } from "@glimstone/svelte/Marquee";

  const people = ["Ines", "Tomasz", "Aiko", "Rafael", "Maren", "Kofi", "Lucía", "Henrik"];
</script>

<div style="width: min(32rem, 100%)">
  <Marquee label="Thanks to" items={people}>
    {#snippet item(name)}{name}{/snippet}
  </Marquee>
</div>
