<script lang="ts" module>
  import type { AvatarSize } from "@glimstone/core";

  export type { AvatarSize } from "@glimstone/core";

  export interface AvatarProps {
    /** The person's name: the accessible name, and where the initials come from. */
    name: string;
    src?: string;
    size?: AvatarSize;
    /** A palette position, for a list of people whose circles each take a hue under rainbow. */
    hueIndex?: number;
  }
</script>

<script lang="ts">
  import * as avatar from "@zag-js/avatar";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { avatarView, initials, pageDir } from "@glimstone/core";
  import { css } from "./style.js";

  // A person's picture, and their initials while it loads, when it fails or when
  // there is none. The name is what a screen reader hears either way.
  let { name, src, size = "md", hueIndex }: AvatarProps = $props();

  const id = $props.id();
  const service = useMachine(avatar.machine, () => ({ id, dir: pageDir() }));
  const api = $derived(avatar.connect(service, normalizeProps));
  const view = $derived(avatarView({ size, hueIndex }));
</script>

<span data-glim="Avatar" {...api.getRootProps()} role="img" aria-label={name} class={view.className} style={css(view.style)}>
  {#if src}
    <img {...api.getImageProps()} {src} alt="" class="glim-avatar-image" />
  {/if}
  <span {...api.getFallbackProps()} aria-hidden="true" class="glim-avatar-fallback">{initials(name)}</span>
</span>
