import { useState } from "react";
import { Fortress, InstanceCard } from "@glimstone/react";
import { fortressTextEn } from "@glimstone/core";
import { APPS, HOME, household, instancesTab, PERMISSIONS } from "../fortressData";

// Not in a fortress yet. The words in TWELVE join it, others are refused.
export default function FortressOut() {
  const [said, setSaid] = useState("Nothing yet");
  return (
    <div className="fortress-demo">
      <Fortress
        text={fortressTextEn}
        lang="en"
        app={HOME}
        joined={false}
        apps={APPS}
        permissions={PERMISSIONS}
        pairedWith={["Pocket", "Studio"]}
        found={{ app: "Bravo", device: "Atlas", logo: APPS[0].logo }}
        hueStart={1}
        {...instancesTab(household(setSaid, () => PERMISSIONS, () => {}))}
      >
        <InstanceCard logo={HOME.logo} name="Atlas" eyebrow={fortressTextEn.thisInstance} facts={["192.168.1.61:3443", "v10.5.3"]} hueIndex={0} />
      </Fortress>
      <output data-hook="said">{said}</output>
    </div>
  );
}
