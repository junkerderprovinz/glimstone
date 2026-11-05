import { useState } from "react";
import { Selector } from "@glimstone/react";

const THEMES = [
  { id: "system", label: "Donaudampfschifffahrtsgesellschaft" },
  { id: "light", label: "Always the light theme" },
  { id: "dark", label: "Always the dark theme" },
  { id: "bright", label: "Bright with a high contrast" },
  { id: "custom", label: "Your own colours" },
];

export default function SelectorPairs() {
  const [a, setA] = useState("light");
  const [b, setB] = useState("light");
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 560 }}>
      <div data-pairs="plain">
        <Selector label="Theme" items={THEMES} value={a} onChange={setA} activation="manual" pairsOnPhone />
      </div>
      <div data-pairs="tight">
        <Selector label="Theme, inline" items={THEMES} value={b} onChange={setB} activation="manual" size="sm" inline buttonHeight pairsOnPhone />
      </div>
    </div>
  );
}
