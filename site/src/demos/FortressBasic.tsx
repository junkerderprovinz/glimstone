import { useRef, useState } from "react";
import { Badge, Button, Fortress, InstanceCard } from "@glimstone/react";
import { fortressTextEn } from "@glimstone/core";
import { APPS, HOME, household, instancesTab, PERMISSIONS } from "../fortressData";

// Inside a fortress: the phrase shows after "letmein", Echo's permission
// refuses to switch, and changing the phrase leaves Wanderer behind.
export default function FortressBasic() {
  const [said, setSaid] = useState("Nothing yet");
  const [permissions, setPermissions] = useState(PERMISSIONS);
  const current = useRef(permissions);
  current.current = permissions;
  const text = fortressTextEn;
  return (
    <div className="fortress-demo">
      <Fortress
        text={text}
        lang="en"
        app={HOME}
        joined
        apps={APPS}
        permissions={permissions}
        phrasePassword
        pairedWith={["Pocket"]}
        hueStart={2}
        {...instancesTab(household(setSaid, () => current.current, setPermissions))}
      >
        {(remove) => (
          <>
            <InstanceCard
              logo={HOME.logo}
              name="Atlas"
              eyebrow={text.thisInstance}
              facts={["192.168.1.61:3443", "v10.5.3"]}
              figures={[
                { value: "14 / 15", label: "Protected" },
                { value: "3 min ago", label: "Last backup" },
              ]}
              hueIndex={0}
              actions={<Button label="Open" labelKey="open" />}
            />
            <InstanceCard
              data-instance="pocket"
              logo={HOME.logo}
              name="Pocket"
              eyebrow={text.forms.android}
              badges={
                <>
                  <Badge>{text.viaRelay}</Badge>
                  <Badge tone="ok">{text.connected}</Badge>
                </>
              }
              facts={["v10.5.3"]}
              hueIndex={1}
              actions={<Button label={text.remove} labelKey="delete" onClick={() => remove("pocket", "Pocket")} />}
            />
          </>
        )}
      </Fortress>
      <output data-hook="said">{said}</output>
    </div>
  );
}
