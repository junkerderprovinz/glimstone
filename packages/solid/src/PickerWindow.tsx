import { children, createEffect, createSignal, For, mergeProps, on, Show, type JSX } from "solid-js";
import {
  fill,
  holdPickHeight,
  isTileMark,
  pageLocale,
  pickSearchKey,
  pickSections,
  pickTileKey,
  pickTileStyle,
  windowFocusTarget,
  type PickGroup,
  type PickItem,
  type PickerText,
} from "@glimstone/core";
import { IconBack, IconClose } from "./glyphs.tsx";
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
  /** Called for every way out: the foot, Escape and a press beside the window. */
  onClose: () => void;
}

export function PickerWindow(props: PickerWindowProps) {
  const merged = mergeProps({ groups: [], actions: [] }, props);
  const [query, setQuery] = createSignal("");
  let card: HTMLDivElement | undefined;
  let search: HTMLInputElement | undefined;
  let scroll: HTMLDivElement | undefined;
  const resolved = children(() => props.children);
  const form = () => resolved.toArray().length > 0;
  createEffect(
    on(form, () => {
      if (scroll?.isConnected) holdPickHeight(scroll);
      if (card) windowFocusTarget(card)?.focus();
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
      class="glim-pick-window"
      text={{ cancel: props.text.cancel, close: props.text.close }}
      actions={form() ? [back(), ...merged.actions] : [{ label: props.text.close, labelKey: "common.close", glyph: <IconClose />, wayOut: true }]}
      onClose={props.onClose}
    >
      <Show when={!form()} fallback={resolved()}>
        <input
          ref={search}
          class="glim-input glim-pick-search"
          type="search"
          aria-label={props.text.search}
          placeholder={props.text.search}
          spellcheck={false}
          autocomplete="off"
          value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => used(e, pickSearchKey(e.key, query(), scroll ?? null, () => setQuery("")))}
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
                    <h3 class="glim-eyebrow">{s.title}</h3>
                  </Show>
                  <ul class="glim-provider-pick">
                    <For each={s.items}>
                      {(item) => (
                        <li style={pickTileStyle(item.mark) as JSX.CSSProperties | undefined}>
                          <ReadmeButton
                            brand="house"
                            parts={[{ name: item.label, onClick: () => props.onPick(item.id) }]}
                            mark={isTileMark(item.mark) ? <BrandMark svg={item.mark.svg} /> : (item.mark as JSX.Element)}
                            markClass={isTileMark(item.mark) ? undefined : "glim-house-mark"}
                            hint={item.hint}
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
