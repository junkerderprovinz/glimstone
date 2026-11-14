import { createSignal } from "solid-js";
import { AngleSlider } from "@glimstone/solid/AngleSlider";

export default function AngleSliderTurn() {
  const [angle, setAngle] = createSignal(90);
  return <AngleSlider label="Turn the picture" value={angle()} onChange={setAngle} />;
}
