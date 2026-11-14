import { useState } from "react";
import { Rating } from "@glimstone/react/Rating";

export default function RatingRelease() {
  const [stars, setStars] = useState(3);
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <Rating label="How well did the update go?" value={stars} onChange={setStars} />
      <Rating label="Average of all answers" value={3.5} onChange={() => {}} allowHalf readOnly />
      <span className="glim-num">{`${stars} of 5`}</span>
    </div>
  );
}
