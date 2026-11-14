<script lang="ts">
  import { IconTipButton } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const ROW = "inline-flex h-8 w-8 items-center justify-center rounded-pill text-carbon-textSub hover:bg-carbon-hover hover:text-carbon-text";
  const up = glyph("IconMoveUp");
  const down = glyph("IconMoveDown");
  const pin = glyph("IconPin");
</script>

<IconTipButton tip="Move up" class={ROW}>{@render up()}</IconTipButton>
<IconTipButton tip="Move down" class={ROW}>{@render down()}</IconTipButton>
<IconTipButton tip="Pin to the top" class={ROW} ariaPressed={false}>{@render pin()}</IconTipButton>
