## 4.8.0

- No changes for Flutter. The password confirmation, the connection row's actions and the new marks live in the web packages.

## 4.7.0

- No changes for Flutter. The connection row, the sign-in catalog and the new marks live in the web packages.

## 4.6.0

- No changes for Flutter. The catalogs and the new mark live in the web packages.

## 4.5.8

- No changes for Flutter. The picker's new states live in the web packages.

## 4.5.7

- No changes for Flutter. The picker's fixes live in the web packages.

## 4.5.6

- No changes for Flutter. The picker's new options live in the web packages.

## 4.5.5

- No changes for Flutter. The picker and the service marks live in the web packages.

## 4.5.4

- `GlimTheme.light`'s `inkLightness` is 0.5, so `accentInk` reads at 4.5:1 on `carbonSurface2` as well. Sunflower's ink is `#7C5F07`, and `statusInfoText` takes the same step.
- `GlimDerived` gains `hover`, the accent's hover as tokens.css works it out: the lightness of `carbonSurface3` with 30% of the accent's chroma. A neutral or quiet `GlimButton` hovers to it, as a row does, instead of 22% of the ink mixed into its own step.

## 4.5.3

- No changes for Flutter. The fix for the window bar and the tab direction lives in tokens.css.

## 4.5.2

- `GlimTheme` gains `brandDiscord`, the Discord mark's colour, written from the tokens.
- `GlimGlyphs` gains `discord`.
- A `GlimTheme` you build with its constructor passes `brandDiscord` as well.

## 4.5.1

- No changes for Flutter. The link to the newest release this release brings lives in the web packages.

## 4.5.0

- `GlimTheme.inkMix` is `inkLightness`, the OKLab step the accent's ink moves to, and `accentInk` moves the accent in OKLab as tokens.css does. `GlimTheme` gains `fieldPlaceholder`, and `focusRing` is a getter on `GlimDerived`.
- `GlimTheme` gains the chart colours: `chart1` to `chart8`, `chartSeq1` to `chartSeq7` and `chartDiv1` to `chartDiv7`.
- `GlimTheme.withAccent(color)` takes a picked accent the way `applyAccent()` does on the web: the fill's ink from the new `glimContrastOn()` and the 14% wash. `accentInk` and `accentHover` then hold 4.5:1 for any picked colour, with the same colours as the web.
- Needs Flutter 3.27 or later, for `Color.r` and `Color.from`.

## 4.4.0

- `GlimTheme` gains `brandFlatpak`, `brandMos` and `brandUmbrel`, the Flatpak, MOS and Umbrel marks' colours, written from the tokens.
- `GlimGlyphs` gains `server` and `laptop`.
- Checked on Flutter 3.47.9. On Flutter 3.50 the analyzer shows deprecation hints for `package:flutter/material.dart`, and the move to `package:material_ui` comes later.

## 4.3.0

- The same number as the other packages. Nothing changed for Flutter.

## 4.2.0

- `GlimTheme` gains `toggleOff`, the off track of a switch, and `GlimTheme.oled`, the dark ramp on true black, both written from the tokens. `glimThemeData(Brightness.dark, oled: true)` uses the OLED colours.

## 4.1.0

- The same number as the other packages. Nothing changed for Flutter.

## 4.0.0

- The tokens as `GlimTheme` and `GlimMetrics`, the glyphs as `GlimGlyphs`, and `GlimButton`.
