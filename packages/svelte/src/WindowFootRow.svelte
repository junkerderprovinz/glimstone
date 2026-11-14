<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface WindowAction {
    label: string;
    /** The translation key behind `label`, which picks the glyph, or `null`. */
    labelKey: string | null;
    glyph?: Snippet;
    /** The forward action, filled with the accent and placed last. */
    primary?: boolean;
    /** This action already leaves the window, so no Cancel or Close is added. */
    wayOut?: boolean;
    disabled?: boolean;
    /** Attributes for the action's button, such as a data hook. */
    attrs?: Record<string, string>;
    /** Runs on press. The window closes afterwards unless it returns false. */
    onClick?: () => void | false;
  }
</script>

<script lang="ts">
  import { windowFoot } from "@glimstone/core";
  import Button from "./Button.svelte";
  import { IconCancel, IconClose } from "./glyphs.js";

  // The foot of a Window or a Sheet: a quiet start line and the actions at the
  // end, with Cancel or Close added by windowFoot() in the core.
  let {
    actions,
    start,
    text,
    onClose,
  }: {
    actions: WindowAction[];
    start?: string | Snippet;
    text: { cancel: string; close: string };
    onClose: () => void;
  } = $props();

  const foot = $derived(
    windowFoot<WindowAction>(actions, start !== undefined, {
      cancel: { label: text.cancel, labelKey: "common.cancel", glyph: IconCancel, wayOut: true },
      close: { label: text.close, labelKey: "common.close", glyph: IconClose, wayOut: true },
    }),
  );
</script>

{#if foot.length > 0}
  <div class="glim-modal-foot">
    {#if start !== undefined}
      <span class="glim-window-start">{#if typeof start === "string"}{start}{:else}{@render start()}{/if}</span>
    {/if}
    {#each foot as a, i (i)}
      <Button
        {...a.attrs}
        label={a.label}
        labelKey={a.labelKey}
        glyph={a.glyph}
        tone={a.primary ? "accent" : "neutral"}
        disabled={a.disabled}
        onClick={() => {
          if (a.onClick?.() !== false) onClose();
        }}
      />
    {/each}
  </div>
{/if}
