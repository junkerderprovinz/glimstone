import { useState } from "react";
import { AngleSlider } from "@glimstone/react/AngleSlider";

export default function AngleSliderTurn() {
  const [angle, setAngle] = useState(90);
  return <AngleSlider label="Turn the picture" value={angle} onChange={setAngle} />;
}
