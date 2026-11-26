import { IconTipButton } from "@glimstone/react";
import { Glyph } from "../glyph";

const ROW = "inline-flex h-8 w-8 items-center justify-center rounded-pill text-carbon-textSub hover:bg-hover hover:text-carbon-text";

export default function IconTipBasic() {
  return (
    <>
      <IconTipButton tip="Move up" shortcut="Alt ↑" className={ROW}>
        <Glyph name="IconMoveUp" />
      </IconTipButton>
      <IconTipButton tip="Move down" shortcut="Alt ↓" className={ROW}>
        <Glyph name="IconMoveDown" />
      </IconTipButton>
      <IconTipButton tip="Pin to the top" className={ROW} ariaPressed={false}>
        <Glyph name="IconPin" />
      </IconTipButton>
    </>
  );
}
