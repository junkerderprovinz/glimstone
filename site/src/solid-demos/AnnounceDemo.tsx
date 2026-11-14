import { announce } from "@glimstone/core";
import { Button } from "@glimstone/solid";

export default function AnnounceDemo() {
  return (
    <>
      <Button label="Say it" labelKey={null} onClick={() => announce("3 rows selected")} />
      <Button label="Say a failure" labelKey={null} tone="danger" onClick={() => announce("The copy failed", "assertive")} />
    </>
  );
}
