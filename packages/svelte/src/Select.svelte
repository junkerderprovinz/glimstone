<script lang="ts" module>
  import type { SelectRows, SelectSize, SelectWidth } from "@glimstone/core";
  import type { SelectGroup, SelectOption } from "./selectParts.svelte.js";

  export type { SelectEntry, SelectGroup, SelectOption, SelectSubmenu } from "./selectParts.svelte.js";
  export type { SelectRows, SelectSize, SelectWidth } from "@glimstone/core";

  export interface SelectProps<T extends string = string> {
    /** The field's name, always the accessible name. Inside a FieldRow the row gives it and draws the words. */
    label?: string;
    /** Draw the label off screen, for a settings row that names the field at its start. */
    hideLabel?: boolean;
    /** Every choice, in list order, for a list without groups. */
    options?: SelectOption<T>[];
    /** The list in runs, with headings and submenus. The wheel steps through every option in list order. */
    groups?: SelectGroup<T>[];
    /** Bound with `bind:value`. Null when there is no one value, such as over a selection whose rows disagree. */
    value: T | null;
    onChange?: (value: T) => void;
    /** Shown while the value is null. */
    placeholder?: string;
    /** Defaults to `fill` for a field and to `steady` for the smaller sizes and inside a FieldRow. */
    width?: SelectWidth;
    size?: SelectSize;
    /** `menu` draws the open list with a context menu's rows, so an app with both shows one kind of menu row. */
    rows?: SelectRows;
    /** Lets a long value run onto a second line instead of ending in an ellipsis, for one whose end says as much as its start, such as a path. */
    wrap?: boolean;
    /** The trigger's id, for a `<label for>` outside the select. */
    id?: string;
    /** Attributes for the trigger, such as a data hook that says the value. */
    triggerAttrs?: Record<string, string>;
    /** The open list's id. */
    listId?: string;
    /** The trigger's own node, bound with `bind:ref`, for a caller that hands it the focus. */
    ref?: HTMLButtonElement | null;
    disabled?: boolean;
    /** A choice is out and its answer not back yet: the trigger keeps its focus but takes no input. */
    busy?: boolean;
    /** A hover bubble, for a trigger with no label beside it whose value does not say what it picks. */
    tip?: string;
    /** The caller's failure counter. Each bump shakes the trigger once, as the value snaps back. */
    shake?: number;
    /** Classes for the trigger, for a size the call site needs. */
    class?: string;
  }
</script>

<script lang="ts" generics="T extends string">
  import { defaultWidth, hasSubmenu, selectTriggerClass } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";
  import ListSelect from "./ListSelect.svelte";
  import MenuSelect from "./MenuSelect.svelte";

  // The one dropdown. Zag carries the behaviour the contract asks for and the
  // select rules in tokens.css carry the look. A list is Zag's select machine;
  // a list with a submenu is its menu machine, since a listbox cannot nest.
  // Both render into the portal target, so no card or scroll box can clip them.
  let {
    size = "field",
    rows = "list",
    label,
    hideLabel,
    width,
    wrap = false,
    class: className = "",
    options,
    groups,
    value = $bindable(),
    onChange,
    ref = $bindable(null),
    ...rest
  }: SelectProps<T> = $props();

  const name = useFieldName(() => label);
  const fromRow = $derived(label === undefined);
  const runs = $derived(groups ?? [{ entries: options ?? [] }]);
  const shared = $derived({
    label: name() ?? "",
    hideLabel: !!hideLabel || fromRow,
    width: width ?? (fromRow ? "steady" : defaultWidth(size)),
    rows,
    groups: runs,
    triggerClass: `${selectTriggerClass(size, wrap)} ${className}`.trim(),
  });

  function pick(next: T) {
    value = next;
    onChange?.(next);
  }
</script>

{#if hasSubmenu(runs)}
  <MenuSelect data-glim="Select" {...rest} {...shared} {value} onChange={pick} bind:ref />
{:else}
  <ListSelect data-glim="Select" {...rest} {...shared} {value} onChange={pick} bind:ref />
{/if}
