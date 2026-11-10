import { useState, type ReactNode } from "react";
import { fill, MARKS, permissionsWith, shake, type FortressAnswer, type FortressApp, type FortressPermission, type FortressText } from "@glimstone/core";
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
  /** Flips one switch. A refusal shakes it back, and the app says why in a toast. */
  onPermission: (id: string, on: boolean) => Promise<FortressAnswer>;
  hueIndex?: number;
  /** Something of the app's own under one permission's words, such as the folder it writes to. */
  extra?: (permission: FortressPermission) => ReactNode;
}

/** What one app may do at another, a switch for each, all on unless switched off. */
export function FortressPermissions({ text, app, apps, permissions, onPermission, hueIndex, extra }: FortressPermissionsProps) {
  const [filter, setFilter] = useState<"all" | "with">("all");
  const mine = permissionsWith(permissions, app.id);
  const shown = filter === "all" ? permissions : mine;
  const logo = (id: string) => {
    const a = apps.find((x) => x.id === id);
    return a?.logo ? <img key={id} src={a.logo} alt="" draggable={false} /> : null;
  };

  async function flip(p: FortressPermission) {
    const answer = await onPermission(p.id, !p.on).catch((): FortressAnswer => ({}));
    const toggle = document.querySelector<HTMLElement>(`[data-permission="${CSS.escape(p.id)}"] .glim-toggle`);
    if (!answer.ok && toggle) shake(toggle);
  }

  return (
    <Card title={text.permissions} hint={text.permissionsAbout} hueIndex={hueIndex}>
      {permissions.length === 0 ? (
        <p className="glim-fortress-sub">{text.noPermissions}</p>
      ) : (
        <>
          <Selector
            label={text.permissions}
            inline
            value={filter}
            onChange={setFilter}
            items={[
              { id: "all", label: `${text.all} ${permissions.length}` },
              { id: "with", label: `${fill(text.withApp, { app: app.name })} ${mine.length}` },
            ]}
          />
          <ul className="glim-permissions">
            {shown.map((p) => (
              <li key={p.id} className={`glim-permission${p.on ? " glim-permission--on" : ""}`} data-permission={p.id}>
                <span className="glim-permission-pair" aria-hidden="true">
                  {logo(p.from)}
                  <MarkSvg mark={MARKS.expand} className="glim-permission-arrow" />
                  <span className="glim-permission-to">{p.to.map(logo)}</span>
                </span>
                <span className="glim-permission-text">
                  <span className="glim-permission-title">{p.title}</span>
                  {p.detail && <span className="glim-fortress-sub">{p.detail}</span>}
                  {extra?.(p)}
                </span>
                <Toggle label={p.title} hideLabel checked={p.on} onChange={() => flip(p)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
