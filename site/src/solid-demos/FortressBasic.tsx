import { createSignal } from "solid-js";
import { Badge, Button, Fortress, InstanceCard } from "@glimstone/solid";
import { fortressTextEn, memberName } from "@glimstone/core";
import { APPS, HOME, household, instancesTab, PERMISSIONS, remembering } from "../fortressData";

// Inside a fortress: the phrase shows after "letmein", Echo's permission
// refuses to switch, changing the phrase leaves Wanderer behind, and a removed
// instance stays named under the switch until the phrase changes. Open says
// what it would open.
export default function FortressBasic() {
  const [said, setSaid] = createSignal("Nothing yet");
  const [permissions, setPermissions] = createSignal(PERMISSIONS);
  const [removed, setRemoved] = createSignal<string[]>([]);
  const text = fortressTextEn;
  const answers = remembering(
    instancesTab(household((what) => setSaid(what), permissions, (next) => setPermissions(next))),
    removed,
    (next) => setRemoved(next),
  );
  return (
    <div class="fortress-demo">
      <Fortress
        text={text}
        lang="en"
        app={HOME}
        joined
        apps={APPS}
        permissions={permissions()}
        phrasePassword
        pairedWith={["Pocket"]}
        hueStart={2}
        notify={(message, severity) => setSaid(`${severity}: ${message}`)}
        removed={removed()}
        onOpen={(a, i) => setSaid(`Opened ${memberName(text, a, i)}`)}
        {...answers}
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
      <output data-hook="said">{said()}</output>
    </div>
  );
}
