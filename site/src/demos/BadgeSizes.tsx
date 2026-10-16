import { Badge } from "@gs/react/Badge";

export default function BadgeSizes() {
  return (
    <>
      <Badge size="small" tone="active">small</Badge>
      <Badge size="medium" tone="active">medium</Badge>
      <Badge size="large" tone="active">large</Badge>
      <Badge size="medium" tone="ok" shape="rounded">rounded</Badge>
      <Badge size="medium" tone="ok" shape="square">square</Badge>
    </>
  );
}
