import { IconTipButton } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

const ROW = "inline-flex h-8 w-8 items-center justify-center rounded-pill text-stone-textSub hover:bg-hover hover:text-stone-text";

export default function IconTipBasic() {
  return (
    <>
      <IconTipButton tip="Move up" shortcut="Alt ↑" class={ROW}>
        <Glyph name="IconMoveUp" />
      </IconTipButton>
      <IconTipButton tip="Move down" shortcut="Alt ↓" class={ROW}>
        <Glyph name="IconMoveDown" />
      </IconTipButton>
      <IconTipButton tip="Pin to the top" class={ROW} ariaPressed={false}>
        <Glyph name="IconPin" />
      </IconTipButton>
    </>
  );
}
