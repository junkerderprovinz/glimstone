import { IconTipButton } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

const ROW = "inline-flex h-8 w-8 items-center justify-center rounded-pill text-carbon-textSub hover:bg-carbon-hover hover:text-carbon-text";

export default function IconTipBasic() {
  return (
    <>
      <IconTipButton tip="Move up" class={ROW}>
        <Glyph name="IconMoveUp" />
      </IconTipButton>
      <IconTipButton tip="Move down" class={ROW}>
        <Glyph name="IconMoveDown" />
      </IconTipButton>
      <IconTipButton tip="Pin to the top" class={ROW} ariaPressed={false}>
        <Glyph name="IconPin" />
      </IconTipButton>
    </>
  );
}
