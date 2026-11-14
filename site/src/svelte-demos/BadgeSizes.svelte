<script lang="ts">
  import { Badge } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const check = glyph("IconCheck");
</script>

<Badge size="small" tone="active">small</Badge>
<Badge size="medium" tone="active">medium</Badge>
<Badge size="large" tone="active">large</Badge>
<Badge size="medium" tone="ok" form="rounded">rounded</Badge>
<Badge size="medium" tone="ok" form="square">square</Badge>
<Badge size="medium" tone="ok" form="pill">pill</Badge>
<Badge size="icon" tone="ok" form="circle" ariaLabel="Done">{@render check()}</Badge>
<Badge size="medium" tone="ok">shape setting</Badge>
