<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ConnectionAction as CoreConnectionAction, ConnectionRowLabelKeys, ConnectionRowText, ConnectionTest, TileMark } from "@glimstone/core";

  export type { ConnectionRowLabelKeys, ConnectionRowText, ConnectionTest } from "@glimstone/core";

  export type ConnectionAction = CoreConnectionAction<Snippet>;

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
    /** Buttons of the app's own, such as Mount, before Test, Edit and Remove, so those keep their places at the end. */
    actions?: ConnectionAction[];
    text: ConnectionRowText;
    labelKeys?: Partial<ConnectionRowLabelKeys>;
    onTest?: () => void;
    onEdit?: () => void;
    onRemove?: () => void;
    class?: string;
  }
</script>

<script lang="ts">
  import { connectionButtons, connectionTestFace, connectionTile } from "@glimstone/core";
  import BrandMark from "./BrandMark.svelte";
  import Button from "./Button.svelte";
  import { IconCheck, IconClose, IconPencil, IconTrash } from "./glyphs.js";
  import { css } from "./style.js";

  // A connected service or account as a compact row ("Connections" in the design
  // language): its mark lit on a tile the row's whole height, its name with any
  // badges, one quiet line on how it stands, and at the end the app's own
  // actions, then its test, edit and remove. A built-in button stands only where
  // its handler is passed. The other props of a <div> go to the row.
  let { name, mark, status, badges, children, test, actions, text, labelKeys, onTest, onEdit, onRemove, class: className, ...rest }: ConnectionRowProps = $props();

  // On a phone the buttons show their glyphs alone, so they keep to one line.
  const NARROW = 640;

  const tile = $derived(connectionTile(mark));
  const buttons = $derived(
    connectionButtons({ actions, test, text, labelKeys, onTest, onEdit, onRemove }, { test: IconCheck, edit: IconPencil, remove: IconTrash }).map((b) => {
      const face = connectionTestFace(b);
      return { ...b, face, glyph: face.outcome === "check" ? IconCheck : face.outcome === "cross" ? IconClose : b.glyph };
    }),
  );
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
      {#if buttons.length > 0}
        <span class="glim-connection-actions">
          {#each buttons as b (b.id)}
            <Button
              label={b.label}
              labelKey={b.labelKey}
              glyph={b.glyph}
              tone={b.face.tone}
              busy={b.busy}
              title={b.title}
              disabled={b.disabled}
              compactBelow={NARROW}
              class={b.face.shake ? "glim-shake" : ""}
              data-connection={b.id}
              onClick={b.onClick}
            />
          {/each}
        </span>
      {/if}
    </div>
  </div>
</div>
