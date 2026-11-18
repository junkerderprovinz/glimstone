import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import {
  fill,
  holdPickHeight,
  isTileMark,
  pageLocale,
  pickerHue,
  pickSearchKey,
  pickSections,
  pickTileKey,
  pickTileStyle,
  windowFocusTarget,
  type PickGroup,
  type PickItem,
  type PickerText,
} from "@glimstone/core";
import { GlyphField } from "./GlyphField.tsx";
import { IconBack, IconClose, IconSearch } from "./glyphs.tsx";
import { IconButton } from "./IconButton.tsx";
import { InfoBubble } from "./InfoBubble.tsx";
import { BrandMark, ReadmeButton } from "./ReadmeButton.tsx";
import { Window, type WindowAction } from "./Window.tsx";

// A big picker ("Pickers and wizards" in design-language.md): the app's choices
// as brand tiles in their groups, under a search that stands open at the top
// end and narrows all of them at once. The arrows move across the grid, and a
// click or Enter on a tile hands its id to onPick. The caller decides what
// follows: it closes the window, or passes the picked tile's form as children,
// which takes the tiles' place with Back and the form's actions in the foot.

export type { PickGroup, PickerText, TileMark } from "@glimstone/core";

export type PickerItem = PickItem<ReactNode>;

export interface PickerWindowProps {
  /** The notch's words, also the window's accessible name. */
  title: string;
  /** What the picker is for, as the (i) in its notch. */
  hint?: string;
  /** The choices, sorted by their names in the page's language. */
  items: PickerItem[];
  /** The groups the items name, in the order they stand. Without them the tiles stand in one. */
  groups?: PickGroup[];
  text: PickerText;
  onPick: (id: string) => void;
  /** The picked tile's form, which takes the tiles' place until it is gone again. */
  children?: ReactNode;
  /** The form's buttons, the forward one last. Cancel and Back stand before them. */
  actions?: WindowAction[];
  /** Back from the form to the tiles, with the search as it was. */
  onBack?: () => void;
  /** Called for every way out: the foot, Escape and, while the tiles show, a press beside the window. */
  onClose: () => void;
}

export function PickerWindow({ title, hint, items, groups = [], text, onPick, children, actions = [], onBack, onClose }: PickerWindowProps) {
  const [query, setQuery] = useState("");
  const [hue] = useState(pickerHue);
  const card = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const form = children !== undefined && children !== null && children !== false;
  useLayoutEffect(() => {
    if (scroll.current) holdPickHeight(scroll.current);
    if (card.current) windowFocusTarget(card.current)?.focus();
  }, [form]);
  // Back keeps the window open, so it returns false.
  const back: WindowAction = {
    label: text.back,
    labelKey: "common.back",
    glyph: <IconBack />,
    onClick: () => {
      onBack?.();
      return false;
    },
  };

  const sections = pickSections(items, groups, query, pageLocale());
  const used = (e: KeyboardEvent, handled: boolean) => {
    if (!handled) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Window
      data-glim="PickerWindow"
      title={title}
      drawn={
        hint ? (
          <>
            {title}
            <InfoBubble tip={hint} onAccent />
          </>
        ) : undefined
      }
      ref={card}
      className={["glim-pick-window", form && "glim-pick-window--form", hue && "glim-hue"].filter(Boolean).join(" ")}
      style={hue ?? undefined}
      text={{ cancel: text.cancel, close: text.close }}
      actions={form ? [back, ...actions] : [{ label: text.close, labelKey: "common.close", glyph: <IconClose />, wayOut: true }]}
      // A stray press beside the window would throw away what was typed into the form.
      closeOnBackdrop={!form}
      onClose={onClose}
    >
      {form ? (
        children
      ) : (
        <>
          <GlyphField
            ref={search}
            className="glim-pick-search"
            glyph={<IconSearch />}
            type="search"
            label={text.search}
            placeholder={text.search}
            spellCheck={false}
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => used(e, pickSearchKey(e.key, query, scroll.current, () => setQuery("")))}
            after={
              query && (
                <IconButton
                  tip={text.clear}
                  glyph={<IconClose />}
                  onClick={() => {
                    setQuery("");
                    search.current?.focus();
                  }}
                />
              )
            }
          />
          <div
            ref={scroll}
            className="glim-pick-scroll"
            onKeyDown={(e) => e.target !== e.currentTarget && used(e, pickTileKey(e.key, e.target as Element, e.currentTarget, search.current))}
          >
            {sections.length === 0 ? (
              <p className="glim-pick-none">{fill(text.none, { query: query.trim() })}</p>
            ) : (
              sections.map((s) => (
                <section key={s.id} className="glim-pick-section">
                  {s.title && <h3 className="glim-eyebrow">{s.title}</h3>}
                  <ul className="glim-provider-pick">
                    {s.items.map((item) => (
                      <li key={item.id} style={pickTileStyle(item.mark) as CSSProperties | undefined}>
                        <ReadmeButton
                          brand="house"
                          parts={[{ name: item.label, sub: item.sub, onClick: () => onPick(item.id) }]}
                          mark={isTileMark(item.mark) ? <BrandMark svg={item.mark.svg} /> : item.mark}
                          markClass={isTileMark(item.mark) ? undefined : "glim-house-mark"}
                          hint={item.hint}
                          tip={item.tip}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </>
      )}
    </Window>
  );
}
