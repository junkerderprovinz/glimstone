import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

import 'support.dart';

List<String> steps(GlimTheme g) => [
      for (final c in [
        g.carbonBg,
        g.carbonSidebar,
        g.carbonSurface,
        g.carbonSurface2,
        g.carbonSurface3,
        g.carbonHover,
        g.carbonHoverRaised,
        g.surfaceOverlay,
        g.toggleOff,
        g.toggleKnob,
        g.carbonBorder,
        g.carbonText,
        g.carbonTextSub,
        g.carbonTextMuted,
        g.sidebarText,
        g.fieldPlaceholder,
      ])
        hex(c),
    ];

void main() {
  const blue = Color(0xFF1D99F3);

  for (final (name, base) in [('light', GlimTheme.light), ('dark', GlimTheme.dark), ('OLED', GlimTheme.oled)]) {
    test('the default accent gives back the stone the tokens were built on, on $name', () {
      expect(steps(base.withAccent(base.accent)), steps(base));
    });
  }

  // What the browser paints for the relative oklch() of each step on #1D99F3.
  test('a picked accent tints the stone as the web does', () {
    final light = GlimTheme.light.withAccent(blue);
    final dark = GlimTheme.dark.withAccent(blue);
    final oled = GlimTheme.oled.withAccent(blue);
    expect(hex(light.carbonBg), '#F4F7FA');
    expect(hex(light.carbonSurface3), '#DDE0E3');
    expect(hex(light.carbonText), '#13161A');
    expect(hex(dark.carbonBg), '#0D1115');
    expect(hex(dark.toggleKnob), '#12171B');
    expect(hex(dark.surfaceOverlay), '#23282D');
    expect(hex(oled.carbonSurface), '#0D1115');
    expect(hex(oled.carbonSurface3), '#272C31');
  });

  test('a grey accent leaves the stone grey', () {
    final dark = GlimTheme.dark.withAccent(const Color(0xFF777777));
    expect(hex(dark.carbonBg), '#101010');
    expect(hex(dark.surfaceOverlay), '#282828');
    expect(hex(GlimTheme.light.withAccent(const Color(0xFF777777)).carbonText), '#161616');
  });

  test('the OLED ground stays black and the light floating surface white', () {
    expect(GlimTheme.oled.withAccent(blue).carbonBg, const Color(0xFF000000));
    expect(GlimTheme.light.withAccent(blue).surfaceOverlay, const Color(0xFFFFFFFF));
  });

  test('glimThemeData takes the accent and tints the theme with it', () {
    final glim = glimThemeData(Brightness.dark, accent: blue).extension<GlimTheme>()!;
    expect(glim.accent, blue);
    expect(hex(glim.carbonBg), '#0D1115');
  });
}
