## Unreleased

- `GlimTheme.inkMix` is `inkLightness`, the OKLab step the accent's ink moves to, and `accentInk` moves the accent in OKLab as tokens.css does. `GlimTheme` gains `fieldPlaceholder`, and `focusRing` is a getter on `GlimDerived`.
- `GlimTheme` gains the chart colours: `chart1` to `chart8`, `chartSeq1` to `chartSeq7` and `chartDiv1` to `chartDiv7`.
- `GlimTheme.withAccent(color)` takes a picked accent the way `applyAccent()` does on the web: the fill's ink from the new `glimContrastOn()` and the 14% wash. `accentInk` and `accentHover` then hold 4.5:1 for any picked colour, with the same colours as the web.
- Needs Flutter 3.27 or later, for `Color.r` and `Color.from`.

## 4.4.1

- The same number as the other packages. Nothing changed for Flutter.

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
