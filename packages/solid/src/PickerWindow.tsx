import { children, createEffect, createSignal, For, mergeProps, on, Show, type JSX } from "solid-js";
import {
  fill,
  holdPickHeight,
  isTileMark,
  pageLocale,
  pickerHue,
  pickFocusTarget,
  pickMarkClass,
  pickSearchKey,
  pickSections,
  pickTileKey,
  pickTileStyle,
  type PickGroup,
  type PickItem,
  type PickerText,
} from "@glimstone/core";
import { Badge } from "./Badge.tsx";
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

export type { PickBadge, PickGroup, PickerText, TileMark } from "@glimstone/core";

export type PickerItem = PickItem<JSX.Element>;

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
  children?: JSX.Element;
  /** The form's buttons, the forward one last. Cancel and Back stand before them. */
  actions?: WindowAction[];
  /** Back from the form to the tiles, with the search as it was. */
  onBack?: () => void;
  /** A quiet line at the start of the foot, such as the verdict of a test. */
  start?: JSX.Element;
  /** The id of the tile picked before, which stands marked and takes the focus when the tiles show. */
  selected?: string;
  /** Called for every way out: the foot, Escape and, while the tiles show, a press beside the window. */
  onClose: () => void;
}

export function PickerWindow(props: PickerWindowProps) {
  const merged = mergeProps({ groups: [], actions: [] }, props);
  const [query, setQuery] = createSignal("");
  const hue = pickerHue();
  let card: HTMLDivElement | undefined;
  let search: HTMLInputElement | undefined;
  let scroll: HTMLDivElement | undefined;
  const resolved = children(() => props.children);
  const form = () => resolved.toArray().length > 0;
  createEffect(
    on(form, () => {
      if (scroll?.isConnected) holdPickHeight(scroll);
      if (card) pickFocusTarget(card, scroll?.isConnected ? scroll : null)?.focus();
    }),
  );
  // Back keeps the window open, so it returns false.
  const back = (): WindowAction => ({
    label: props.text.back,
    labelKey: "common.back",
    glyph: <IconBack />,
    onClick: () => {
      props.onBack?.();
      return false;
    },
  });

  const sections = () => pickSections(props.items, merged.groups, query(), pageLocale());
  const used = (e: KeyboardEvent, handled: boolean) => {
    if (!handled) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Window
      data-glim="PickerWindow"
      title={props.title}
      drawn={
        props.hint ? (
          <>
            {props.title}
            <InfoBubble tip={props.hint} onAccent />
          </>
        ) : undefined
      }
      ref={(el) => (card = el)}
      class={["glim-pick-window", form() && "glim-pick-window--form", hue && "glim-hue"].filter(Boolean).join(" ")}
      style={hue ?? undefined}
      text={{ cancel: props.text.cancel, close: props.text.close }}
      start={props.start}
      actions={form() ? [back(), ...merged.actions] : [{ label: props.text.close, labelKey: "common.close", glyph: <IconClose />, wayOut: true }]}
      // A stray press beside the window would throw away what was typed into the form.
      closeOnBackdrop={!form()}
      onClose={props.onClose}
    >
      <Show when={!form()} fallback={resolved()}>
        <GlyphField
          ref={(el) => (search = el)}
          class="glim-pick-search"
          glyph={<IconSearch />}
          type="search"
          label={props.text.search}
          placeholder={props.text.search}
          spellcheck={false}
          autocomplete="off"
          value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => used(e, pickSearchKey(e.key, query(), scroll ?? null, () => setQuery("")))}
          after={
            <Show when={query()}>
              <IconButton
                tip={props.text.clear}
                glyph={<IconClose />}
                onClick={() => {
                  setQuery("");
                  search?.focus();
                }}
              />
            </Show>
          }
        />
        <div
          ref={scroll}
          class="glim-pick-scroll"
          onKeyDown={(e) => e.target !== e.currentTarget && used(e, pickTileKey(e.key, e.target as Element, e.currentTarget, search ?? null))}
        >
          <Show when={sections().length > 0} fallback={<p class="glim-pick-none">{fill(props.text.none, { query: query().trim() })}</p>}>
            <For each={sections()}>
              {(s) => (
                <section class="glim-pick-section">
                  <Show when={s.title}>
                    <div class="glim-pick-eyebrow">
                      <h3 class="glim-eyebrow">{s.title}</h3>
                      <Show when={s.badge}>
                        {(badge) => (
                          <Badge size="small" tone={badge().tone}>
                            {badge().label}
                          </Badge>
                        )}
                      </Show>
                      <Show when={s.hint}>{(hint) => <InfoBubble tip={hint()} />}</Show>
                    </div>
                  </Show>
                  <ul class="glim-provider-pick">
                    <For each={s.items}>
                      {(item) => (
                        <li style={pickTileStyle(item.mark) as JSX.CSSProperties | undefined}>
                          <ReadmeButton
                            brand="house"
                            parts={[{ name: item.label, sub: item.sub, onClick: item.status ? undefined : () => props.onPick(item.id) }]}
                            soonLabel={item.status}
                            current={item.id === props.selected}
                            mark={isTileMark(item.mark) ? <BrandMark svg={item.mark.svg} hover={item.mark.hover} /> : (item.mark as JSX.Element)}
                            markClass={pickMarkClass(item.mark)}
                            hint={item.hint}
                            tip={item.tip}
                          />
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
              )}
            </For>
          </Show>
        </div>
      </Show>
    </Window>
  );
}
