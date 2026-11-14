<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { FloatingPanelText, PanelSize } from "@glimstone/core";

  export type { FloatingPanelText, PanelSize } from "@glimstone/core";

  export interface FloatingPanelProps {
    title: string;
    /** Whether it is open, bound with `bind:open`. */
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The size it opens at. */
    defaultSize?: PanelSize;
    resizable?: boolean;
    children: Snippet;
    text?: Partial<FloatingPanelText>;
  }
</script>

<script lang="ts">
  import * as floatingPanel from "@zag-js/floating-panel";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { FLOATING_PANEL_TEXT, pageDir } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import { IconClose, IconWindowMaximise, IconWindowMinimise, IconWindowRestore } from "./glyphs.js";
  import { lift } from "./lift.js";

  // A window that stays open beside the work, such as a transfer log, and that
  // somebody moves by its head and sizes by its edges. It is a window like any
  // other (rule 15): the same surface and radius, its title in the notch and its
  // way out in the foot, at the float step since nothing behind it is darkened.
  let {
    title,
    open = $bindable(),
    onOpenChange,
    defaultSize = { width: 360, height: 280 },
    resizable = true,
    children,
    text,
  }: FloatingPanelProps = $props();

  const AXES = ["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const;
  const words = $derived({ ...FLOATING_PANEL_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(floatingPanel.machine, () => ({
    id,
    dir: pageDir(),
    open,
    defaultSize,
    resizable,
    strategy: "fixed" as const,
    closeOnEscape: true,
    onOpenChange: (d: { open: boolean }) => {
      open = d.open;
      onOpenChange?.(d.open);
    },
    translations: { minimize: words.minimize, maximize: words.maximize, restore: words.restore },
  }));
  const api = $derived(floatingPanel.connect(service, normalizeProps));
</script>

<div {@attach lift} data-glim="FloatingPanel" class="glim-fpanel-layer">
  <div {...api.getPositionerProps()} class="glim-fpanel-positioner">
    <div {...api.getContentProps()} class="glim-fpanel">
      <div {...api.getDragTriggerProps()} class="glim-fpanel-drag">
        <div {...api.getHeaderProps()} class="glim-fpanel-head">
          <h2 {...api.getTitleProps()} class="glim-panel-heading">
            <Badge tone="heading" size="heading" wrap>{title}</Badge>
          </h2>
          <div {...api.getControlProps()} class="glim-fpanel-control">
            <button {...api.getStageTriggerProps({ stage: "minimized" })} class="glim-btn-bare glim-icon-btn">{@render IconWindowMinimise()}</button>
            <button {...api.getStageTriggerProps({ stage: "maximized" })} class="glim-btn-bare glim-icon-btn">{@render IconWindowMaximise()}</button>
            <button {...api.getStageTriggerProps({ stage: "default" })} class="glim-btn-bare glim-icon-btn">{@render IconWindowRestore()}</button>
          </div>
        </div>
      </div>
      <div {...api.getBodyProps()} class="glim-fpanel-body">{@render children()}</div>
      <div class="glim-fpanel-foot">
        <Button label={words.close} labelKey={null} glyph={IconClose} onClick={() => api.setOpen(false)} />
      </div>
      {#if resizable}
        {#each AXES as axis (axis)}
          <div {...api.getResizeTriggerProps({ axis })} class="glim-fpanel-edge"></div>
        {/each}
      {/if}
    </div>
  </div>
</div>
