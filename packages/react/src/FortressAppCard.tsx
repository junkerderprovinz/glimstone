import { appCardView, openInBrowser, presenceTone, type FortressApp, type FortressInstance, type FortressText } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { InstanceCard } from "./InstanceCard.tsx";
import { glyphFor } from "./glyphs.tsx";

export type { FortressApp, FortressInstance } from "@glimstone/core";

export interface FortressAppCardProps {
  app: FortressApp;
  text: FortressText;
  /** The interface language, for the counts. */
  lang: string;
  hueIndex?: number;
  /** Opens an instance's own page. Without it the page opens in a new tab. */
  onOpen?: (app: FortressApp, instance: FortressInstance) => void;
}

const presenceText = (text: FortressText, i: FortressInstance) => ({ connected: text.connected, checking: text.checking, away: text.away })[i.presence];

/** The state of one instance: reached through the relay, and connected, checking or away. */
export function PresenceBadges({ instance, text }: { instance: FortressInstance; text: FortressText }) {
  return (
    <span data-glim="PresenceBadges" style={{ display: "contents" }}>
      {instance.relay && <Badge>{text.viaRelay}</Badge>}
      <Badge tone={presenceTone(instance.presence)}>{presenceText(text, instance)}</Badge>
    </span>
  );
}

/** A device's glyph, asked for by its kind through the app's resolver (`deviceServer`, `devicePc`, `deviceLaptop`, `devicePhone`). */
export function deviceGlyph(kind: FortressInstance["deviceKind"]) {
  return kind ? glyphFor(`device${kind.charAt(0).toUpperCase()}${kind.slice(1)}`) : undefined;
}

/** Another app of the fortress: its state, where it runs, and the way to open it. */
export function FortressAppCard({ app, text, lang, hueIndex, onOpen }: FortressAppCardProps) {
  const view = appCardView(app, text, lang);
  return (
    <InstanceCard
      data-glim="FortressAppCard"
      data-fortress-app={app.id}
      logo={app.logo}
      name={app.name}
      eyebrow={view.eyebrow}
      hueIndex={hueIndex}
      badges={
        <>
          {view.needs && <Badge tone="warn">{view.needs}</Badge>}
          <PresenceBadges instance={view.main} text={text} />
        </>
      }
      facts={view.facts}
      actions={
        view.open ? (
          <Button
            label={view.open.label}
            labelKey="open"
            onClick={() => (onOpen ? onOpen(app, view.main) : openInBrowser(view.open!.href))}
          />
        ) : (
          <span className="glim-instance-note">{view.note}</span>
        )
      }
    >
      {view.rows.length > 0 && (
        <ul className="glim-instance-rows">
          {view.rows.map(({ instance, sub }) => (
            <li key={instance.id} className="glim-instance-row" data-instance={instance.id}>
              <span className="glim-instance-device" aria-hidden="true">
                {deviceGlyph(instance.deviceKind)}
              </span>
              <span className="glim-instance-row-text">
                <span className="glim-instance-row-name">{instance.device}</span>
                <span className="glim-instance-row-sub glim-num">{sub}</span>
              </span>
              <Badge tone={presenceTone(instance.presence)}>{presenceText(text, instance)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </InstanceCard>
  );
}
