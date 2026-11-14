import { createSignal, For, Show, type JSX } from "solid-js";
import { fill, MARKS, permissionsWith, shake, type FortressAnswer, type FortressApp, type FortressPermission, type FortressText, type ToastSeverity } from "@glimstone/core";
import { Card } from "./Card.tsx";
import { Selector } from "./Selector.tsx";
import { Toggle } from "./Toggle.tsx";
import { MarkSvg } from "./glyphs.tsx";

export type { FortressPermission } from "@glimstone/core";

export interface FortressPermissionsProps {
  text: FortressText;
  /** The app showing the card, for the filter "With {app}". */
  app: { id: string; name: string };
  /** Every app of the fortress, this one included, for the marks. */
  apps: Pick<FortressApp, "id" | "name" | "logo">[];
  permissions: FortressPermission[];
  /** Saves one switch the moment it flips. A refusal leaves it as it was and shakes it. */
  onPermission: (id: string, on: boolean) => Promise<FortressAnswer>;
  /** Puts the small confirmation of a save, or the reason it failed, into the app's toasts. */
  notify?: (message: string, severity: ToastSeverity) => void;
  hueIndex?: number;
  /** Something of the app's own under one permission's words, such as the folder it writes to. */
  extra?: (permission: FortressPermission) => JSX.Element;
}

/** What one app may do at another, a switch for each, all on unless switched off. */
export function FortressPermissions(props: FortressPermissionsProps) {
  const [filter, setFilter] = createSignal<"all" | "with">("all");
  const mine = () => permissionsWith(props.permissions, props.app.id);
  // The filter is offered only where it leaves some permissions out.
  const narrows = () => mine().length < props.permissions.length;
  const shown = () => (filter() === "all" || !narrows() ? props.permissions : mine());
  // Rows follow the permission's id, so a saved switch keeps its focus when the app hands in the new list.
  const ids = () => shown().map((p) => p.id);
  const logo = (id: string) => {
    const a = props.apps.find((x) => x.id === id);
    return a?.logo ? <img src={a.logo} alt="" draggable={false} /> : null;
  };

  async function flip(p: FortressPermission) {
    const answer = await props.onPermission(p.id, !p.on).catch((): FortressAnswer => ({}));
    if (answer.ok) {
      props.notify?.(fill(p.on ? props.text.permissionOff : props.text.permissionOn, { permission: p.title }), "success");
      return;
    }
    props.notify?.(answer.error ?? props.text.failed, "fail");
    const toggle = document.querySelector<HTMLElement>(`[data-permission="${CSS.escape(p.id)}"] .glim-toggle`);
    if (toggle) shake(toggle);
  }

  return (
    <Card data-glim="FortressPermissions" title={props.text.permissions} hint={props.text.permissionsAbout} hueIndex={props.hueIndex}>
      <Show when={props.permissions.length > 0} fallback={<p class="glim-fortress-sub">{props.text.noPermissions}</p>}>
        <Show when={narrows()}>
          <Selector
            label={props.text.permissions}
            inline
            activation="manual"
            value={filter()}
            onChange={setFilter}
            items={[
              { id: "all", label: `${props.text.all} ${props.permissions.length}` },
              { id: "with", label: `${fill(props.text.withApp, { app: props.app.name })} ${mine().length}` },
            ]}
          />
        </Show>
        <ul class="glim-permissions">
          <For each={ids()}>
            {(id) => {
              const p = () => shown().find((x) => x.id === id)!;
              return (
                <li class={`glim-permission${p().on ? " glim-permission--on" : ""}`} data-permission={id}>
                  <span class="glim-permission-pair" aria-hidden="true">
                    {logo(p().from)}
                    <MarkSvg mark={MARKS.expand} class="glim-permission-arrow" />
                    <span class="glim-permission-to">{p().to.map(logo)}</span>
                  </span>
                  <span class="glim-permission-text">
                    <span class="glim-permission-title">{p().title}</span>
                    <Show when={p().detail}>
                      <span class="glim-fortress-sub">{p().detail}</span>
                    </Show>
                    {props.extra?.(p())}
                  </span>
                  <Toggle label={p().title} hideLabel checked={p().on} onChange={() => flip(p())} />
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
    </Card>
  );
}
