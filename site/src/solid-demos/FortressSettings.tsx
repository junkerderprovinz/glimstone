import { createSignal } from "solid-js";
import { Badge, Button, Fortress, FortressPairing, InstanceCard } from "@glimstone/solid";
import { fortressTextEn, memberName } from "@glimstone/core";
import { APPS, HOME, household, PERMISSIONS } from "../fortressData";

// The fortress on a pairing page of its own: the card with the phrase, its
// change and Leave at the top, then the other apps drawn with the app's own
// card, and no second Show phrase in the corner. The code carries the
// address of an own relay after the words. The app's card removes through
// the fortress's own window.
export default function FortressSettings() {
  const [said, setSaid] = createSignal("Nothing yet");
  const [permissions, setPermissions] = createSignal(PERMISSIONS);
  const answers = household((what) => setSaid(what), permissions, (next) => setPermissions(next));
  const text = fortressTextEn;
  return (
    <div class="fortress-demo">
      <FortressPairing
        text={text}
        lang="en"
        app={HOME}
        pairedWith={["Pocket"]}
        phrasePassword
        phraseQr={(words) => `${words.join(" ")}\nhttps://relay.example`}
        onShowPhrase={answers.onShowPhrase}
        onChangePhrase={answers.onChangePhrase}
        onLeave={answers.onLeave}
        hueIndex={0}
      />
      <Fortress
        text={text}
        lang="en"
        app={HOME}
        joined
        apps={APPS}
        permissions={permissions()}
        showOthers
        hueStart={1}
        onJoin={answers.onJoin}
        onPermission={answers.onPermission}
        onRemove={answers.onRemove}
        renderApp={(app, hueIndex, remove) => (
          <InstanceCard
            data-own-card={app.id}
            logo={app.logo}
            name={app.name}
            badges={<Badge tone="ok">{text.connected}</Badge>}
            facts={app.instances.map((i) => i.device)}
            hueIndex={hueIndex}
            actions={
              remove && (
                <Button
                  label={text.remove}
                  labelKey="delete"
                  tone="subtle"
                  onClick={() => remove(app.instances[0]!.id, memberName(text, app, app.instances[0]!))}
                />
              )
            }
          />
        )}
      />
      <output data-hook="said">{said()}</output>
    </div>
  );
}
