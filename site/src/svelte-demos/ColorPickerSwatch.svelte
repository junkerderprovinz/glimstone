<script lang="ts">
  import { Button, ColorPicker, Window } from "@glimstone/svelte";

  type Swatch = { hex: string; name: string | null; anchor: HTMLElement | null };
  const fresh = (): Swatch => ({ hex: "#1b6b73", name: "Petrol", anchor: null });

  const page = $state(fresh());
  let inWindow = $state(fresh());
  let open = $state(false);
</script>

{#snippet swatch(label: string, s: Swatch)}
  <span class="demo-swatch-row">
    <button
      type="button"
      aria-label={label}
      class="demo-swatch"
      style="background-color: {s.hex}"
      onclick={(e) => (s.anchor = s.anchor ? null : e.currentTarget)}
    ></button>
    <span data-applied>{s.name} {s.hex}</span>
    {#if s.anchor}
      <ColorPicker
        value={s.hex}
        anchor={s.anchor}
        onApply={(hex, name) => {
          s.hex = hex;
          s.name = name;
        }}
        onClose={() => (s.anchor = null)}
      />
    {/if}
  </span>
{/snippet}

<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
  {@render swatch("Label colour", page)}
  <Button
    label="Open in a window"
    labelKey={null}
    onClick={() => {
      inWindow = fresh();
      open = true;
    }}
  />
  {#if open}
    <Window title="Label" text={{ cancel: "Cancel", close: "Close" }} onClose={() => (open = false)}>
      {@render swatch("Label colour in the window", inWindow)}
    </Window>
  {/if}
</div>
