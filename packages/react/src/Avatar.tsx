import { useId } from "react";
import * as avatar from "@zag-js/avatar";
import { normalizeProps, useMachine } from "@zag-js/react";
import { avatarView, initials, pageDir, type AvatarSize } from "@glimstone/core";

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

export function Avatar({ name, src, size = "md", hueIndex }: AvatarProps) {
  const service = useMachine(avatar.machine, { id: useId(), dir: pageDir() });
  const api = avatar.connect(service, normalizeProps);
  const view = avatarView({ size, hueIndex });
  return (
    <span data-glim="Avatar" {...api.getRootProps()} role="img" aria-label={name} className={view.className} style={view.style}>
      {src && <img {...api.getImageProps()} src={src} alt="" className="glim-avatar-image" />}
      <span {...api.getFallbackProps()} aria-hidden="true" className="glim-avatar-fallback">
        {initials(name)}
      </span>
    </span>
  );
}
