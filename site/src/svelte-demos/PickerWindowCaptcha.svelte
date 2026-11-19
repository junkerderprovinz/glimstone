<script lang="ts">
  import { Button, PickerWindow } from "@glimstone/svelte";
  import { CAPTCHA_TEXT, captchaLine, captchaPicker } from "../captchaData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = captchaPicker(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
</script>

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Add a solver" labelKey="add" onClick={() => (open = true)} />
  <output>{captchaLine(picked)}</output>
  {#if open}
    <PickerWindow
      title="Add a captcha solver"
      hint="A paid service that solves captchas before anyone is asked. Its API key comes next."
      {items}
      {groups}
      text={CAPTCHA_TEXT}
      onPick={(id) => {
        open = false;
        picked = id;
      }}
      onClose={() => (open = false)}
    />
  {/if}
</div>
