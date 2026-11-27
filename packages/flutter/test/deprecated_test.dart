// Deprecated names an app may still pass until the release that removes them:
// the test is that it compiles and looks the way it did.
// ignore_for_file: deprecated_member_use_from_same_package

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

void main() {
  test('a carbon name reads the stone step that took its place', () {
    for (final g in [GlimTheme.light, GlimTheme.dark, GlimTheme.oled]) {
      expect(g.carbonBg, g.stoneGround);
      expect(g.carbonSurface3, g.stoneSurface3);
      expect(g.carbonHoverRaised, g.stoneHoverRaised);
      expect(g.carbonTextMuted, g.stoneTextMuted);
    }
  });

  test('a carbon argument sets the stone step, and a stone argument wins over it', () {
    const red = Color(0xFFFF0000);
    const blue = Color(0xFF0000FF);
    expect(GlimTheme.dark.copyWith(carbonSurface2: red).stoneSurface2, red);
    expect(GlimTheme.dark.copyWith(carbonSurface2: red, stoneSurface2: blue).stoneSurface2, blue);
  });

  test('carbonHover keeps its colour and follows a picked accent', () {
    expect(GlimTheme.dark.carbonHover, const Color(0xFF302E28));
    expect(GlimTheme.dark.withAccent(const Color(0xFF1D99F3)).carbonHover, isNot(GlimTheme.dark.carbonHover));
  });

  test('a state background argument is taken and the background stays worked out from the solid', () {
    final theme = GlimTheme.light.copyWith(statusOkBg: const Color(0xFFFF0000), statusWarnBgSoft: const Color(0xFFFF0000));
    expect(theme.statusOkBg, GlimTheme.light.statusOkBg);
    expect(theme.statusWarnBgSoft, GlimTheme.light.statusWarnBgSoft);
  });

  test('a solid state hover still mixes the solid toward the text', () {
    final g = GlimTheme.dark;
    expect(g.statusOkHover, Color.lerp(g.statusOkSolid, g.stoneText, 0.15));
    expect(g.statusFailHover, Color.lerp(g.statusFailSolid, g.stoneText, 0.15));
  });
}
