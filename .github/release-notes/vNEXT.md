OLED and the system's colour, both asked for in ArrowLoop. A switch under the Design picker puts the dark look on true black for OLED and AMOLED screens, and a wand swatch before the accent presets takes the device's own colour wherever the platform has one. The colour engine also keeps every ink it computes at 4.5:1, whatever colour feeds it, so a picked or a system colour reads as well as the presets do.

**Adopting apps:**

- **Moving up:** install `@glimstone/core` with `@glimstone/react` or `@glimstone/vue` at vNEXT, all at the same number. Nothing is renamed or removed.
- **OLED:** put a `Toggle` labelled OLED under the Design picker, with an info bubble that says it gives true black for OLED and AMOLED screens. Call `applyOled(on)` from `@glimstone/core`, which keeps the choice on the device, and keep it out of any settings a server syncs. `applyCachedAppearance()` applies it at boot, and an app that boots its own way calls `applyOled(storedOled())`. `darkShowing()` and `watchDarkShowing()` tell a settings page whether OLED is in effect.
- **The system colour:** feed the device's colour with `setSystemAccent(hex)`, from Material You on Android, from the desktop's accent in a native shell, or with `watchBrowserAccent(setSystemAccent)` on the plain web. While `systemAccent()` returns a colour, draw a swatch with `IconAccentSystem` first in the accent row and store a click on it as `SYSTEM_ACCENT`, the word `system`, never as the hex. `subscribeSystemAccent()` says when the swatch should come or go.
- **Ink on a fill:** `contrastOn()` and `--accent-contrast` take whichever of white and `#161616` reads better, so Blue, Red, Purple, Orange and Magenta carry near-black ink where they carried white, in the accent and in the rainbow alike. A test of the app's own that expects white on those fills needs the new value.
- **Accent text:** an app stylesheet that defines `--accent-ink` itself should read `--accent-ink-light` and `--accent-ink-dark` first, as `tokens.css` does, or a very pale or very dark accent loses its 4.5:1.
- **`contrastOn`** lives in `contrast.ts` and is still exported from `appearance.ts` and from the package.
- **Flutter:** move the git dependency to `ref: vNEXT`. `GlimTheme.oled` holds the OLED colours, and `glimThemeData(Brightness.dark, oled: true)` uses them.
- **Version:** `GLIMSTONE_VERSION` from `@glimstone/core` reads vNEXT.

## ✨ Added

- **OLED**: `data-oled` on `<html>` puts the dark ramp on a black ground whenever dark shows, chosen or from the system. The surfaces move one step down (card and rail `#161616`, surface2 `#262626`, surface3 `#393939`, border `#262626`), the hover steps keep their place, the shadow becomes a ring and a lit brand tile gets an edge. The text stays as it is. `applyOled`, `storedOled`, `darkShowing`, `watchDarkShowing` and `resolvesDark` are in the new `theme.ts`.
- **The system accent**: the accent setting can be `system`. `setSystemAccent` feeds the device's colour, the core repaints whenever it changes, and the last colour is remembered on the device so the first frame after a reload is already right. `resolveAccent`, `systemAccent` and `subscribeSystemAccent` come with it.
- **The browser as a source**: `watchBrowserAccent`, `browserAccent` and `browserAccentWorks` read CSS `AccentColor` where it carries the system's colour, which is Firefox and Safari. Chromium answers with a fixed colour, so it counts as no source. The file lists the other limits.
- **`contrast.ts`**: `contrastRatio`, `contrastOn`, `accentInks` and `MIN_TEXT_CONTRAST`, the arithmetic behind the 4.5:1.
- **`IconAccentSystem`**: a wand with three sparks for the system colour swatch, drawn for GlimStone.
- **Unit tests for the core**, with `npm test` and in CI: the contrast math with near white, near black, mid grey, saturated blue and yellow, the accent modes, OLED and the browser source.
- **The site** has the OLED switch under the theme picker, the wand swatch in Firefox and Safari, and an OLED column on the palette page.

## 🎨 Design

- **Rule 43: OLED is the dark look on true black, a switch under the Design picker and not a fourth theme.** It counts whenever dark shows, so somebody who follows the system gets black at night without touching it again. It belongs to the screen, so it is kept on the device and never synced.
- **Rule 44: the system's colour is a source for the accent, and a wand swatch stands first wherever there is one.** It is stored as `system`, so one device's wallpaper never travels to another. Where there is no source the swatch is not shown. The wand does not bring back the ninth swatch, because there is nothing in it to edit.
- **Rule 45: every ink the colour engine computes reaches 4.5:1, whatever colour feeds it.** The ink is pushed toward black or white only as far as it needs, so every preset keeps its accent text exactly.

## 🐛 Fixed

- **Ink on five presets:** white on Blue, Red, Purple, Orange and Magenta read at only 2.3 to 3.0:1. They carry `#161616` instead, at 5.9 to 7.7:1.
- **Accent text in a light panel on a dark page:** a `[data-theme="light"]` element inside a dark page took the dark ramp's `--accent-ink`. It gets the light one.
