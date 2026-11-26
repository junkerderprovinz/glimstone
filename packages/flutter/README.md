# glimstone

[GlimStone](https://junkerderprovinz.github.io/glimstone/) for Flutter: the
tokens as a `ThemeExtension`, the light, glyph and motion engines beside them,
the glyph assortment as a set, and the widgets built on them.

```yaml
dependencies:
  glimstone:
    git:
      url: https://github.com/junkerderprovinz/glimstone.git
      path: packages/flutter
      ref: v4.9.2
```

```dart
import 'package:glimstone/glimstone.dart';

MaterialApp(
  theme: glimThemeData(Brightness.light, accent: picked),
  darkTheme: glimThemeData(Brightness.dark, accent: picked, light: GlimLight.glow),
  home: Center(
    child: GlimButton(label: 'Save', glyph: GlimGlyphs.save, tone: GlimTone.accent, onPressed: save),
  ),
);
```

- `GlimTheme.dark` and `GlimTheme.light` carry every colour of `tokens.css`.
  An app with a theme of its own adds one to `ThemeData.extensions` and reads it
  with `Theme.of(context).extension<GlimTheme>()`. `GlimTheme.oled` is the dark
  one on true black, and `glimThemeData(Brightness.dark, oled: true)` uses it.
  The ground, the surfaces and the text are stone with a faint tint of the
  accent, and `withAccent` works the steps out again for a picked colour the
  way the browser does. `GlimMetrics` holds the lengths: the type scale, button heights and
  width stages.
- `GlimEngines` holds the light (`off`, `edge`, `glow` and the hidden
  `stone`), the glyph style (`filled` or `line`) and the motion level. Reduced
  motion stills every level but storm, as on the web.
- IBM Plex Sans ships with the package under the SIL Open Font License
  (`fonts/OFL.txt`) and is the face of `glimThemeData`. Noto Sans stands
  behind it for the scripts Plex does not draw, and an app that needs them
  ships Noto itself.
- `GlimGlyphs` holds every glyph by meaning, and `GlimGlyph` draws one in the
  ambient icon colour, filled or as its Lucide line drawing (ISC,
  `LICENSE-lucide.txt`).
- `GlimCard` carries the raised step as the light engine lights it, `GlimWell`
  nests its corner inside the card, and `GlimSwitch` keeps its knob 3px inside the
  track, off, on and pressed. Fields take the translucent steps from the
  theme and never draw a line.
- `GlimButton` follows the same contract as the web packages: Enter and Space
  act, the label stays the accessible name when the mode shows only the glyph,
  busy keeps the width, and a surface button takes the accent under the pointer.

The colours are written from the DTCG source in `packages/core/tokens` by
`scripts/build-tokens.mjs`. `scripts/gen-flutter.mjs` writes the engines, the
stone ramp, the type and the glyphs from the same source and the core. Edit the
source and run the scripts, never the generated files.
