import { Badge } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function BadgeSizes() {
  return (
    <>
      <Badge size="small" tone="active">small</Badge>
      <Badge size="medium" tone="active">medium</Badge>
      <Badge size="large" tone="active">large</Badge>
      <Badge size="medium" tone="ok" form="rounded">rounded</Badge>
      <Badge size="medium" tone="ok" form="square">square</Badge>
      <Badge size="medium" tone="ok" form="pill">pill</Badge>
      <Badge size="icon" tone="ok" form="circle" ariaLabel="Done">
        <Glyph name="IconCheck" />
      </Badge>
      <Badge size="medium" tone="ok">shape setting</Badge>
    </>
  );
}
