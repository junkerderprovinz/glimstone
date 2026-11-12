import { useState } from "react";
import { appCardView, doubtView, memberName, openInstance, presenceTone, type FortressApp, type FortressInstance, type FortressText } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { InfoBubble } from "./InfoBubble.tsx";
import { InstanceCard } from "./InstanceCard.tsx";
import { Window } from "./Window.tsx";
import { glyphFor } from "./glyphs.tsx";

export type { FortressApp, FortressInstance } from "@glimstone/core";

export interface FortressAppCardProps {
  app: FortressApp;
  text: FortressText;
  /** The interface language, for the counts. */
  lang: string;
  hueIndex?: number;
  /** Opens an instance, through the fortress where it runs elsewhere. Without it the instance's `open.href` opens in a new tab. */
  onOpen?: (app: FortressApp, instance: FortressInstance) => void;
  /** Asks before an instance is removed, with its name. Without it nothing here removes. */
  onRemove?: (id: string, name: string) => void;
  /** The label key behind Remove, which picks its glyph. */
  removeKey?: string;
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

export interface FortressDoubtWindowProps {
  app: FortressApp;
  instance: FortressInstance;
  text: FortressText;
  /** Runs on Open anyway. The window closes either way. */
  onOpen: () => void;
  onClose: () => void;
}

/**
 * The question before an instance with `doubt` opens: two members claim the
 * same app on the same device, so the person opens one only by the end of its
 * id. An app that draws the other apps in cards of its own shows it before
 * `onOpen`.
 */
export function FortressDoubtWindow({ app, instance, text, onOpen, onClose }: FortressDoubtWindowProps) {
  const view = doubtView(text, app, instance);
  return (
    <Window
      data-glim="FortressDoubtWindow"
      title={view.title}
      text={{ cancel: text.cancel, close: text.close }}
      onClose={onClose}
      actions={[{ label: view.open, labelKey: "open", primary: true, attrs: { "data-fortress": "open-anyway" }, onClick: onOpen }]}
    >
      <div className="glim-fortress-text">
        <p>{view.body}</p>
      </div>
    </Window>
  );
}

/** Another app of the fortress: its state, where it runs, and the way to open it. */
export function FortressAppCard({ app, text, lang, hueIndex, onOpen, onRemove, removeKey = "delete" }: FortressAppCardProps) {
  const view = appCardView(app, text, lang);
  const [asking, setAsking] = useState<FortressInstance | null>(null);
  const open = (instance: FortressInstance) => (instance.doubt ? setAsking(instance) : openInstance(app, instance, onOpen));
  // Remove stays quiet at the end of a row, or after Open on a card with one instance.
  const remove = (instance: FortressInstance, inRow: boolean) =>
    onRemove &&
    !instance.self && (
      <Button
        label={text.remove}
        labelKey={removeKey}
        tone="subtle"
        variant={inRow ? "icon" : "default"}
        compact={inRow}
        title={memberName(text, app, instance)}
        onClick={() => onRemove(instance.id, memberName(text, app, instance))}
        data-fortress="open-remove"
      />
    );
  const single = view.rows.length === 0;
  const removes = single && onRemove && !view.main.self;
  return (
    <>
      <InstanceCard
        data-glim="FortressAppCard"
        data-fortress-app={app.id}
        logo={app.logo}
        name={app.name}
        eyebrow={view.eyebrow}
        hueIndex={hueIndex}
        badges={
          <>
            {view.doubt && (
              <Badge tone="warn">
                {view.doubt.label}
                <InfoBubble tip={view.doubt.tip} onAccent />
              </Badge>
            )}
            {view.needs && <Badge tone="warn">{view.needs}</Badge>}
            <PresenceBadges instance={view.main} text={text} />
          </>
        }
        facts={view.facts}
        actions={
          (view.open || removes) && (
            <>
              {view.open && <Button label={view.open.label} labelKey="open" onClick={() => open(view.main)} data-fortress="open" />}
              {single && remove(view.main, false)}
            </>
          )
        }
      >
        {!single && (
          <ul className="glim-instance-rows">
            {view.rows.map(({ instance, sub, open: opens }) => (
              <li key={instance.id} className="glim-instance-row" data-instance={instance.id}>
                <span className="glim-instance-device" aria-hidden="true">
                  {deviceGlyph(instance.deviceKind)}
                </span>
                <span className="glim-instance-row-text">
                  <span className="glim-instance-row-name">{instance.device}</span>
                  <span className="glim-instance-row-sub glim-num">{sub}</span>
                </span>
                <span className="glim-instance-row-end">
                  <Badge tone={presenceTone(instance.presence)}>{presenceText(text, instance)}</Badge>
                  {opens && (
                    <Button
                      label={text.open}
                      labelKey="open"
                      tone="subtle"
                      variant="icon"
                      compact
                      title={memberName(text, app, instance)}
                      onClick={() => open(instance)}
                      data-fortress="open"
                    />
                  )}
                  {remove(instance, true)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </InstanceCard>
      {asking && <FortressDoubtWindow app={app} instance={asking} text={text} onOpen={() => openInstance(app, asking, onOpen)} onClose={() => setAsking(null)} />}
    </>
  );
}
