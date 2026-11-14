import { createMemo, createSignal, For, mergeProps, Show } from "solid-js";
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
export function PresenceBadges(props: { instance: FortressInstance; text: FortressText }) {
  return (
    <span data-glim="PresenceBadges" style={{ display: "contents" }}>
      <Show when={props.instance.relay}>
        <Badge>{props.text.viaRelay}</Badge>
      </Show>
      <Badge tone={presenceTone(props.instance.presence)}>{presenceText(props.text, props.instance)}</Badge>
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
export function FortressDoubtWindow(props: FortressDoubtWindowProps) {
  const view = createMemo(() => doubtView(props.text, props.app, props.instance));
  return (
    <Window
      data-glim="FortressDoubtWindow"
      title={view().title}
      text={{ cancel: props.text.cancel, close: props.text.close }}
      onClose={props.onClose}
      actions={[{ label: view().open, labelKey: "open", primary: true, attrs: { "data-fortress": "open-anyway" }, onClick: props.onOpen }]}
    >
      <div class="glim-fortress-text">
        <p>{view().body}</p>
      </div>
    </Window>
  );
}

/** Another app of the fortress: its state, where it runs, and the way to open it. */
export function FortressAppCard(props: FortressAppCardProps) {
  const merged = mergeProps({ removeKey: "delete" }, props);
  const view = createMemo(() => appCardView(merged.app, merged.text, merged.lang));
  const [asking, setAsking] = createSignal<FortressInstance | null>(null);
  const open = (instance: FortressInstance) => (instance.doubt ? setAsking(instance) : openInstance(merged.app, instance, merged.onOpen));
  const name = (instance: FortressInstance) => memberName(merged.text, merged.app, instance);
  // Remove stays quiet at the end of a row, or after Open on a card with one instance.
  const remove = (instance: FortressInstance, inRow: boolean) => (
    <Show when={merged.onRemove && !instance.self}>
      <Button
        label={merged.text.remove}
        labelKey={merged.removeKey}
        tone="subtle"
        variant={inRow ? "icon" : "default"}
        compact={inRow}
        title={name(instance)}
        onClick={() => merged.onRemove!(instance.id, name(instance))}
        data-fortress="open-remove"
      />
    </Show>
  );
  const single = () => view().rows.length === 0;
  const removes = () => single() && merged.onRemove && !view().main.self;
  return (
    <>
      <InstanceCard
        data-glim="FortressAppCard"
        data-fortress-app={merged.app.id}
        logo={merged.app.logo}
        name={merged.app.name}
        eyebrow={view().eyebrow}
        hueIndex={merged.hueIndex}
        badges={
          <>
            <Show when={view().doubt}>
              {(doubt) => (
                <Badge tone="warn">
                  {doubt().label}
                  <InfoBubble tip={doubt().tip} onAccent />
                </Badge>
              )}
            </Show>
            <Show when={view().needs}>
              <Badge tone="warn">{view().needs}</Badge>
            </Show>
            <PresenceBadges instance={view().main} text={merged.text} />
          </>
        }
        facts={view().facts}
        actions={
          (view().open || removes()) && (
            <>
              <Show when={view().open}>
                {(opens) => <Button label={opens().label} labelKey="open" onClick={() => open(view().main)} data-fortress="open" />}
              </Show>
              <Show when={single()}>{remove(view().main, false)}</Show>
            </>
          )
        }
      >
        <Show when={!single()}>
          <ul class="glim-instance-rows">
            <For each={view().rows}>
              {({ instance, sub, open: opens }) => (
                <li class="glim-instance-row" data-instance={instance.id}>
                  <span class="glim-instance-device" aria-hidden="true">
                    {deviceGlyph(instance.deviceKind)}
                  </span>
                  <span class="glim-instance-row-text">
                    <span class="glim-instance-row-name">{instance.device}</span>
                    <span class="glim-instance-row-sub glim-num">{sub}</span>
                  </span>
                  <span class="glim-instance-row-end">
                    <Badge tone={presenceTone(instance.presence)}>{presenceText(merged.text, instance)}</Badge>
                    <Show when={opens}>
                      <Button
                        label={merged.text.open}
                        labelKey="open"
                        tone="subtle"
                        variant="icon"
                        compact
                        title={name(instance)}
                        onClick={() => open(instance)}
                        data-fortress="open"
                      />
                    </Show>
                    {remove(instance, true)}
                  </span>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </InstanceCard>
      <Show when={asking()}>
        {(instance) => (
          <FortressDoubtWindow
            app={merged.app}
            instance={instance()}
            text={merged.text}
            onOpen={() => openInstance(merged.app, instance(), merged.onOpen)}
            onClose={() => setAsking(null)}
          />
        )}
      </Show>
    </>
  );
}
