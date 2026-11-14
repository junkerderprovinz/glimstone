import { createSignal } from "solid-js";
import { FortressPairing } from "@glimstone/solid";
import { fortressTextEn } from "@glimstone/core";
import { HOME, household, PERMISSIONS } from "../fortressData";

// The pairing settings: the one place to change the phrase or leave.
export default function FortressPairingDemo() {
  const [said, setSaid] = createSignal("Nothing yet");
  const answers = household((what) => setSaid(what), () => PERMISSIONS, () => {});
  return (
    <div class="fortress-demo">
      <FortressPairing text={fortressTextEn} lang="en" app={HOME} pairedWith={["Pocket"]} onLeave={answers.onLeave} onChangePhrase={answers.onChangePhrase} />
      <output data-hook="said">{said()}</output>
    </div>
  );
}
