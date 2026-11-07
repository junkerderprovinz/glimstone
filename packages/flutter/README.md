# glimstone

[GlimStone](https://junkerderprovinz.github.io/glimstone/) for Flutter: the
tokens as a `ThemeExtension`, the glyph assortment as a set, and the widgets
built on them.

```yaml
dependencies:
  glimstone:
    git:
      url: https://github.com/junkerderprovinz/glimstone.git
      path: packages/flutter
      ref: v4.2.5
```

```dart
import 'package:glimstone/glimstone.dart';

MaterialApp(
  theme: glimThemeData(Brightness.light),
  darkTheme: glimThemeData(Brightness.dark),
  home: Center(
    child: GlimButton(label: 'Save', glyph: GlimGlyphs.save, tone: GlimTone.accent, onPressed: save),
  ),
);
```

- `GlimTheme.dark` and `GlimTheme.light` carry every colour of `tokens.css`;
  an app with a theme of its own adds one to `ThemeData.extensions` and reads it
  with `Theme.of(context).extension<GlimTheme>()`. `GlimTheme.oled` is the dark
  one on true black, and `glimThemeData(Brightness.dark, oled: true)` uses it. `GlimMetrics` holds the
  lengths: radii, the type scale, button heights and width stages.
- `GlimGlyphs` holds every glyph by meaning, and `GlimGlyph` draws one in the
  ambient icon colour.
- `GlimButton` follows the same contract as the web packages: Enter and Space
  act, the label stays the accessible name when the mode shows only the glyph,
  busy keeps the width, and a surface button takes the accent under the pointer.

The tokens and glyphs are written from the core by `scripts/gen-flutter.mjs`;
edit `tokens.css` or `glyphs.json` and run it, never the generated files.
