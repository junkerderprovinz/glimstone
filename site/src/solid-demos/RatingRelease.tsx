import { createSignal } from "solid-js";
import { Rating } from "@glimstone/solid/Rating";

export default function RatingRelease() {
  const [stars, setStars] = createSignal(3);
  return (
    <div style={{ display: "grid", gap: "12px", "justify-items": "start" }}>
      <Rating label="How well did the update go?" value={stars()} onChange={setStars} />
      <Rating label="Average of all answers" value={3.5} onChange={() => {}} allowHalf readOnly />
      <span class="glim-num">{`${stars()} of 5`}</span>
    </div>
  );
}
