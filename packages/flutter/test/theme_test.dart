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
}
