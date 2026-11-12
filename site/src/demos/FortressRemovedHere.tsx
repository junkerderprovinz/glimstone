import { Fortress, InstanceCard } from "@glimstone/react";
import { fortressTextEn } from "@glimstone/core";
import { APPS, HOME, household, instancesTab, PERMISSIONS } from "../fortressData";

// Another member removed Alpha, so the empty place says so until it joins again.
export default function FortressRemovedHere() {
  return (
    <div className="fortress-demo">
      <Fortress
        text={fortressTextEn}
        lang="en"
        app={HOME}
        joined={false}
        removedHere
        apps={APPS}
        permissions={PERMISSIONS}
        hueStart={1}
        {...instancesTab(household(() => {}, () => PERMISSIONS, () => {}))}
      >
        <InstanceCard logo={HOME.logo} name="Atlas" eyebrow={fortressTextEn.thisInstance} facts={["v10.5.3"]} hueIndex={0} />
      </Fortress>
    </div>
  );
}
