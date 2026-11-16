import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

// The web's inks for the same accents, from packages/core/src/oklab.ts.
void expectNear(Color actual, int expected) {
  final want = Color(expected);
  for (final (a, b) in [(actual.r, want.r), (actual.g, want.g), (actual.b, want.b)]) {
    expect((a - b).abs(), lessThanOrEqualTo(1.5 / 255));
  }
}

void main() {
  test('the light ramp darkens Sunflower onto its ink step', () {
    expectNear(GlimTheme.light.accentInk, 0xFF836407);
  });

  test('a bright accent is its own ink on the dark ramp', () {
    expect(GlimTheme.dark.accentInk, GlimTheme.dark.accent);
  });

  test('a dim accent is lifted onto the dark ramp ink step', () {
    expectNear(GlimTheme.dark.copyWith(accent: const Color(0xFF1D99F3)).accentInk, 0xFF62B1F8);
  });

  test('the focus ring is the ink', () {
    expect(GlimTheme.light.focusRing, GlimTheme.light.accentInk);
  });

  test('a row hovers to the accent on its ramp\'s hover step', () {
    expectNear(GlimTheme.dark.hover, 0xFF403313);
    expectNear(GlimTheme.oled.hover, 0xFF2E2101);
    expectNear(GlimTheme.light.hover, 0xFFEFDFBB);
  });

  test('a filled control hovers to the accent a step further up', () {
    expectNear(GlimTheme.dark.hoverFilled, 0xFF5C4F2F);
    expectNear(GlimTheme.dark.hoverRaised, 0xFF7A6C4B);
    expectNear(GlimTheme.oled.hoverRaised, 0xFF5C4F2F);
    expectNear(GlimTheme.light.hoverFilled, 0xFFE0D0AC);
    expectNear(GlimTheme.light.hoverRaised, 0xFFD5C5A1);
  });

  test('the hover follows a picked accent', () {
    expectNear(GlimTheme.dark.withAccent(const Color(0xFF1D99F3)).hover, 0xFF1F374E);
    expectNear(GlimTheme.light.withAccent(const Color(0xFF1D99F3)).hover, 0xFFC7E4FF);
  });
}
