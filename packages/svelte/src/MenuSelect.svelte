<script lang="ts" generics="T extends string">
  import { untrack } from "svelte";
  import * as menu from "@zag-js/menu";
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { closeOnPageMove, faceLabels, flattenRuns, homeRow, isSubmenu, pageDir, SELECT_POSITIONING, selectRootClass, selectRowParts } from "@glimstone/core";
  import { useTipBubble } from "./bubble.svelte.js";
  import { IconExpand } from "./glyphs.js";
  import { lift } from "./lift.js";
  import MenuChoice from "./MenuChoice.svelte";
  import MenuSubmenu from "./MenuSubmenu.svelte";
  import { usePortalHue } from "./portalHue.svelte.js";
  import SelectFace from "./SelectFace.svelte";
  import { useTriggerMotion, type InnerProps } from "./selectParts.svelte.js";
  import TipBubble from "./TipBubble.svelte";
  import TipWrap from "./TipWrap.svelte";

  // A list with submenus: Zag's menu machine with radio items, since a listbox
  // cannot nest.
  let {
    "data-glim": glim,
    label,
    hideLabel,
    groups,
    value,
    onChange,
    placeholder,
    width,
    rows,
    triggerClass,
    id,
    triggerAttrs,
    listId,
    ref = $bindable(null),
    disabled,
    busy,
    tip,
    shake,
  }: InnerProps<T> = $props();

  const uid = $props.id();
  const service = useMachine(menu.machine, () => ({
    id: uid,
    ids: { trigger: id, content: listId },
    dir: pageDir(),
    "aria-label": label,
    positioning: SELECT_POSITIONING,
  }));
  const api = $derived(menu.connect(service, normalizeProps));
  const open = $derived(api.open);
  const all = $derived(flattenRuns(groups));
  const glyphs = $derived(all.some((o) => o.glyph));
  const parts = $derived(selectRowParts(rows, glyphs));
  const text = $derived(faceLabels(all, value, placeholder, width).text);
  const subId = (gi: number, ei: number) => `${uid}-sub-${gi}-${ei}`;

  const bubble = useTipBubble(() => tip, () => !!disabled);
  $effect.pre(() => {
    bubble.trigger = ref;
  });
  useTriggerMotion(() => ref, {
    all: () => all,
    value: () => value,
    inert: () => !!(disabled || busy),
    onChange: (v) => onChange(v),
    count: () => shake ?? 0,
  });
  const hue = usePortalHue(() => open, () => ref);

  $effect(() => {
    if (!open) return;
    const stop = closeOnPageMove(() => api.setOpen(false));
    // Zag highlights on the frame after the list opens, so the home row goes
    // one frame later still.
    const home = untrack(() => homeRow(groups, value, subId));
    if (home === null) return stop;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => api.setHighlightedValue(home));
    });
    return () => {
      stop();
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  });

  // While busy the trigger keeps focus but nothing reaches the machine.
  const hold = (name: "onpointerdown" | "onclick" | "onkeydown") => (e: Event) => {
    if (busy) e.preventDefault();
    else (api.getTriggerProps() as Record<string, ((e: Event) => void) | undefined>)[name]?.(e);
  };
</script>

<div data-glim={glim} class={selectRootClass(width)}>
  {#if !hideLabel}
    <span aria-hidden="true" class="glim-field-label">{label}</span>
  {/if}
  <div>
    <TipWrap on={!!disabled && !!tip} show={bubble.show} hide={bubble.hide}>
      <button
        {...triggerAttrs}
        {...api.getTriggerProps()}
        bind:this={ref}
        onfocus={bubble.showOnFocus}
        onblur={bubble.hide}
        onmouseenter={bubble.show}
        onmouseleave={bubble.hide}
        aria-describedby={bubble.describedBy}
        onpointerdown={hold("onpointerdown")}
        onclick={hold("onclick")}
        onkeydown={hold("onkeydown")}
        {disabled}
        data-disabled={disabled ? "" : undefined}
        data-readonly={busy ? "" : undefined}
        aria-busy={busy || undefined}
        aria-label={`${label}: ${text}`}
        class={triggerClass}
      >
        <SelectFace {all} {value} {placeholder} {width} {glyphs} />
        <span {...api.getIndicatorProps()} class="glim-select-indicator">{@render IconExpand()}</span>
      </button>
    </TipWrap>
  </div>
  <TipBubble state={bubble} />
  <div {@attach lift} {...mergeProps(api.getPositionerProps(), { style: hue.style })} class={`glim-select-positioner ${hue.className}`.trim()}>
    <div {...api.getContentProps()} class={parts.content}>
      {#each groups as g, gi (gi)}
        {#if g.entries.length > 0}
          <div {...g.heading ? api.getItemGroupProps({ id: `g${gi}` }) : {}} class="glim-select-group">
            {#if g.heading}
              <div {...api.getItemGroupLabelProps({ htmlFor: `g${gi}` })} class={parts.heading}>{g.heading}</div>
            {/if}
            {#each g.entries as e, ei (isSubmenu(e) ? `s${ei}` : e.value)}
              {#if isSubmenu(e)}
                <MenuSubmenu parent={service} parentApi={api} triggerId={subId(gi, ei)} entry={e} {value} {onChange} {parts} {hue} />
              {:else}
                <MenuChoice {api} option={e} {value} {onChange} {parts} />
              {/if}
            {/each}
          </div>
        {/if}
      {/each}
    </div>
  </div>
</div>
