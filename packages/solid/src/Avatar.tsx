import { createMemo, createUniqueId, mergeProps, Show } from "solid-js";
import * as avatar from "@zag-js/avatar";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { avatarView, initials, pageDir, type AvatarSize } from "@glimstone/core";
import { css } from "./style.ts";

export type { AvatarSize } from "@glimstone/core";

// A person's picture, and their initials while it loads, when it fails or when
// there is none. The name is what a screen reader hears either way.

export interface AvatarProps {
  /** The person's name: the accessible name, and where the initials come from. */
  name: string;
  src?: string;
  size?: AvatarSize;
  /** A palette position, for a list of people whose circles each take a hue under rainbow. */
  hueIndex?: number;
}

export function Avatar(raw: AvatarProps) {
  const props = mergeProps({ size: "md" } as const, raw);
  const id = createUniqueId();
  const service = useMachine(avatar.machine, () => ({ id, dir: pageDir() }));
  const api = createMemo(() => avatar.connect(service, normalizeProps));
  const view = createMemo(() => avatarView({ size: props.size, hueIndex: props.hueIndex }));
  return (
    <span data-glim="Avatar" {...api().getRootProps()} role="img" aria-label={props.name} class={view().className} style={css(view().style)}>
      <Show when={props.src}>
        <img {...api().getImageProps()} src={props.src} alt="" class="glim-avatar-image" />
      </Show>
      <span {...api().getFallbackProps()} aria-hidden="true" class="glim-avatar-fallback">
        {initials(props.name)}
      </span>
    </span>
  );
}
