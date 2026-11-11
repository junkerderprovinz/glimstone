import { useState } from "react";
import { FortressPairing } from "@glimstone/react";
import { fortressTextEn } from "@glimstone/core";
import { HOME, household, PERMISSIONS } from "../fortressData";

// The pairing settings: the one place to change the phrase or leave.
export default function FortressPairingDemo() {
  const [said, setSaid] = useState("Nothing yet");
  const answers = household(setSaid, () => PERMISSIONS, () => {});
  return (
    <div className="fortress-demo">
      <FortressPairing
        text={fortressTextEn}
        lang="en"
        app={HOME}
        pairedWith={["Pocket"]}
        onLeave={answers.onLeave}
        onChangePhrase={answers.onChangePhrase}
      />
      <output data-hook="said">{said}</output>
    </div>
  );
}
