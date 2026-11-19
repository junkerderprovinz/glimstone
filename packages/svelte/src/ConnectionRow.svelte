<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ConnectionRowLabelKeys, ConnectionRowText, ConnectionTest, TileMark } from "@glimstone/core";

  export type { ConnectionRowLabelKeys, ConnectionRowText, ConnectionTest } from "@glimstone/core";

  export interface ConnectionRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "class"> {
    /** The service's name, also the row's accessible name. */
    name: string;
    /** A brand's mark from a catalog, which stands on its own colour, or one of the app's glyphs, which stands on the accent. */
    mark: TileMark | Snippet;
    /** One quiet line under the name, such as who is signed in or where it connects. */
    status?: string;
    /** Badges after the name, for a state that is not the normal case, such as a failed connection. */
    badges?: Snippet;
    /** More quiet lines under the status, such as what uses the connection. */
    children?: Snippet;
    /** Where the test stands: `busy` while it runs, then `tone` and a `title` with what it found. */
    test?: ConnectionTest;
    text: ConnectionRowText;
    labelKeys?: Partial<ConnectionRowLabelKeys>;
    onTest?: () => void;
    onEdit?: () => void;
    onRemove?: () => void;
    class?: string;
  }
</script>

<script lang="ts">
  import { CONNECTION_ROW_KEYS, connectionTestFace, connectionTile } from "@glimstone/core";
  import BrandMark from "./BrandMark.svelte";
  import Button from "./Button.svelte";
  import { IconCheck, IconClose } from "./glyphs.js";
  import { css } from "./style.js";

  // A connected service or account as a compact row ("Connections" in the design
  // language): its mark lit on a tile the row's whole height, its name with any
  // badges, one quiet line on how it stands, and its test, edit and remove at
  // the end. A button stands only where its handler is passed. The other props
  // of a <div> go to the row.
  let { name, mark, status, badges, children, test, text, labelKeys, onTest, onEdit, onRemove, class: className, ...rest }: ConnectionRowProps = $props();

  // On a phone the buttons show their glyphs alone, so they keep to one line.
  const NARROW = 640;

  const keys = $derived({ ...CONNECTION_ROW_KEYS, ...labelKeys });
  const tile = $derived(connectionTile(mark));
  const face = $derived(connectionTestFace(test));
  const outcome = $derived(face.outcome === "check" ? IconCheck : face.outcome === "cross" ? IconClose : undefined);
</script>

<div data-glim="ConnectionRow" role="group" aria-label={name} {...rest} class={["glim-well glim-connection", className].filter(Boolean).join(" ")}>
  <span class="glim-connection-tile" style={css(tile.style)} aria-hidden="true">
    <span class="glim-connection-mark">
      {#if tile.svg !== undefined}<BrandMark svg={tile.svg} />{:else}{@render (mark as Snippet)()}{/if}
    </span>
  </span>
  <div class="glim-connection-main">
    <div class="glim-connection-head">
      <span class="glim-connection-name">{name}</span>
      {#if badges}<span class="glim-connection-badges">{@render badges()}</span>{/if}
    </div>
    <div class="glim-connection-foot">
      <div class="glim-connection-about">
        {#if status}<p class="glim-connection-status">{status}</p>{/if}
        {@render children?.()}
      </div>
      {#if onTest || onEdit || onRemove}
        <span class="glim-connection-actions">
          {#if onTest}
            <Button
              label={text.test}
              labelKey={keys.test}
              glyph={outcome}
              tone={face.tone}
              busy={test?.busy}
              title={test?.title}
              compactBelow={NARROW}
              class={face.shake ? "glim-shake" : ""}
              data-connection="test"
              onClick={onTest}
            />
          {/if}
          {#if onEdit}<Button label={text.edit} labelKey={keys.edit} compactBelow={NARROW} data-connection="edit" onClick={onEdit} />{/if}
          {#if onRemove}<Button label={text.remove} labelKey={keys.remove} compactBelow={NARROW} data-connection="remove" onClick={onRemove} />{/if}
        </span>
      {/if}
    </div>
  </div>
</div>
