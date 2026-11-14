<script lang="ts" generics="T extends string">
  import * as select from "@zag-js/select";
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { closeOnPageMove, endOption, flattenRuns, pageDir, SELECT_POSITIONING, selectRootClass, selectRowParts } from "@glimstone/core";
  import { useTipBubble } from "./bubble.svelte.js";
  import { IconCheck, IconExpand } from "./glyphs.js";
  import { lift } from "./lift.js";
  import { usePortalHue } from "./portalHue.svelte.js";
  import SelectFace from "./SelectFace.svelte";
  import { useTriggerMotion, type InnerProps, type SelectGroup, type SelectOption } from "./selectParts.svelte.js";
  import TipBubble from "./TipBubble.svelte";
  import TipWrap from "./TipWrap.svelte";

  // A list without submenus: Zag's select machine, a listbox.
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
  const all = $derived(flattenRuns(groups));
  const glyphs = $derived(all.some((o) => o.glyph));
  const parts = $derived(selectRowParts(rows, glyphs));
  const service = useMachine(select.machine, () => ({
    id: uid,
    ids: { trigger: id, content: listId },
    dir: pageDir(),
    collection: select.collection({
      items: all,
      itemToValue: (o: SelectOption<T>) => o.value,
      itemToString: (o: SelectOption<T>) => o.label,
      isItemDisabled: (o: SelectOption<T>) => !!o.disabled,
    }),
    value: value === null ? [] : [value],
    disabled,
    readOnly: busy,
    onValueChange: (d: { value: string[] }) => {
      const next = d.value[0];
      if (next !== undefined && next !== value) onChange(next as T);
    },
    positioning: SELECT_POSITIONING,
  }));
  const api = $derived(select.connect(service, normalizeProps));
  const open = $derived(api.open);

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
  $effect(() => {
    if (open) return closeOnPageMove(() => api.setOpen(false));
  });
  const hue = usePortalHue(() => open, () => ref);

  const choices = (g: SelectGroup<T>) => g.entries as SelectOption<T>[];

  function keydown(e: KeyboardEvent) {
    const to = api.open ? undefined : endOption(all, e.key);
    if (to === undefined) return (api.getTriggerProps() as { onkeydown?: (e: KeyboardEvent) => void }).onkeydown?.(e);
    e.preventDefault();
    api.setOpen(true);
    api.setHighlightValue(to);
  }
</script>

<div data-glim={glim} {...api.getRootProps()} class={selectRootClass(width)}>
  <label {...api.getLabelProps()} class={hideLabel ? "glim-sr-only" : "glim-field-label"}>{label}</label>
  <div {...api.getControlProps()}>
    <TipWrap on={!!disabled && !!tip} show={bubble.show} hide={bubble.hide}>
      <button
        {...triggerAttrs}
        {...api.getTriggerProps()}
        onkeydown={keydown}
        bind:this={ref}
        onfocus={bubble.showOnFocus}
        onblur={bubble.hide}
        onmouseenter={bubble.show}
        onmouseleave={bubble.hide}
        aria-describedby={bubble.describedBy}
        aria-busy={busy || undefined}
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
          <div {...g.heading ? api.getItemGroupProps({ id: `${uid}-g${gi}` }) : {}} class="glim-select-group">
            {#if g.heading}
              <div {...api.getItemGroupLabelProps({ htmlFor: `${uid}-g${gi}` })} class={parts.heading}>{g.heading}</div>
            {/if}
            {#each choices(g) as item (item.value)}
              <div {...api.getItemProps({ item })} class={parts.item}>
                {#if parts.glyph}
                  <span class={parts.glyph}>{@render item.glyph?.()}</span>
                {/if}
                <span {...api.getItemTextProps({ item })} class={parts.label}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })} class={parts.check}>{@render IconCheck()}</span>
              </div>
            {/each}
          </div>
        {/if}
      {/each}
    </div>
  </div>
  <select {...api.getHiddenSelectProps()}></select>
</div>
