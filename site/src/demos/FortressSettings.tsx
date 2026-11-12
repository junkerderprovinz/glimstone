import { useState } from "react";
import { Badge, Fortress, FortressPairing, InstanceCard } from "@glimstone/react";
import { fortressTextEn } from "@glimstone/core";
import { APPS, HOME, household, PERMISSIONS } from "../fortressData";

// The fortress on a pairing page of its own: the card with the phrase, its
// change and Leave at the top, then the other apps drawn with the app's own
// card, and no second Show phrase in the corner. The code carries the
// address of an own relay after the words.
export default function FortressSettings() {
  const [said, setSaid] = useState("Nothing yet");
  const [permissions, setPermissions] = useState(PERMISSIONS);
  const answers = household(setSaid, () => permissions, setPermissions);
  const text = fortressTextEn;
  return (
    <div className="fortress-demo">
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
        permissions={permissions}
        showOthers
        hueStart={1}
        onJoin={answers.onJoin}
        onPermission={answers.onPermission}
        onRemove={answers.onRemove}
        renderApp={(app, hueIndex) => (
          <InstanceCard
            data-own-card={app.id}
            logo={app.logo}
            name={app.name}
            badges={<Badge tone="ok">{text.connected}</Badge>}
            facts={app.instances.map((i) => i.device)}
            hueIndex={hueIndex}
          />
        )}
      />
      <output data-hook="said">{said}</output>
    </div>
  );
}
