<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { FieldWidth } from "@glimstone/core";

  export interface PathFieldProps extends Omit<HTMLInputAttributes, "value" | "type" | "width" | "class"> {
    /** The path, bound with `bind:value`. */
    value: string;
    /** Called with the path as it is typed and as the picker answers. */
    onChange?: (path: string) => void;
    /** Handed the path in the field. Answers with a path, or with nothing when the person left. */
    pick: (current: string) => string | null | undefined | Promise<string | null | undefined>;
    /** Called with a path the picker answered with, after onChange. */
    onPicked?: (path: string) => void;
    /** The accessible name. Inside a FieldRow the row gives it. */
    label?: string;
    width?: FieldWidth;
    /** The button's words. */
    text?: { pick: string };
    /** The button's glyph, an open folder unless set, such as a file for a picker of files. */
    glyph?: Snippet;
    /** Shows the button's glyph alone, as it does by itself with less than 20rem of room. */
    compact?: boolean;
    /** Attributes for the button, such as a data hook. */
    buttonAttrs?: Record<string, string>;
    /** Classes for the wrapper, which carries the width. */
    class?: string;
    /** The <input>, bound with `bind:ref`. */
    ref?: HTMLInputElement | null;
  }
</script>

<script lang="ts">
  import { fieldWidthClass, PATH_ROOM_PX } from "@glimstone/core";
  import Button from "./Button.svelte";
  import { useFieldName } from "./fieldName.js";
  import { IconFolderOpen } from "./glyphs.js";

  // A path to type and a button that asks the app for one. GlimStone does not
  // know where an app's folders come from, so `pick` is the app's own: it opens
  // whatever it opens and answers with a path. The other props of an <input> go
  // to the field.
  let {
    value = $bindable(),
    onChange,
    pick,
    onPicked,
    label,
    width,
    text = { pick: "Choose" },
    glyph,
    compact = false,
    buttonAttrs,
    class: className,
    style,
    disabled,
    ref = $bindable(null),
    ...rest
  }: PathFieldProps = $props();

  const name = useFieldName(() => label);
  let box: HTMLSpanElement;
  let tight = $state(false);
  $effect(() => {
    const watcher = new ResizeObserver(([entry]) => (tight = entry!.contentRect.width < PATH_ROOM_PX));
    watcher.observe(box);
    return () => watcher.disconnect();
  });

  function set(path: string) {
    value = path;
    onChange?.(path);
  }

  async function ask() {
    const answer = await pick(value);
    ref?.focus();
    if (!answer) return;
    set(answer);
    onPicked?.(answer);
  }
</script>

<span data-glim="PathField" bind:this={box} class={["glim-path", fieldWidthClass(width), className].filter(Boolean).join(" ")} {style}>
  <input
    spellcheck={false}
    autocomplete="off"
    aria-label={name()}
    {...rest}
    bind:this={ref}
    type="text"
    {value}
    {disabled}
    oninput={(e) => set(e.currentTarget.value)}
    class="glim-input glim-input--mono"
  />
  <Button
    {...buttonAttrs}
    variant="icon"
    label={text.pick}
    labelKey={null}
    glyph={glyph ?? IconFolderOpen}
    compact={compact || tight}
    disabled={!!disabled}
    onClick={ask}
  />
</span>
