// Deprecated names an app may still pass until 5.0.0: the test is that it
// compiles and looks the way it did.
// ignore_for_file: deprecated_member_use_from_same_package

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

void main() {
  test('an inkMix below 1 asks for the light ink step, 1 for the dark one', () {
    expect(GlimTheme.dark.copyWith(inkMix: 0.55).inkLightness, GlimTheme.light.inkLightness);
    expect(GlimTheme.light.copyWith(inkMix: 1).inkLightness, GlimTheme.dark.inkLightness);
  });

  test('inkMix reads back as it did: 0.55 on a light theme, 1 on a dark one', () {
    expect(GlimTheme.light.inkMix, 0.55);
    expect(GlimTheme.dark.inkMix, 1);
    expect(GlimTheme.oled.inkMix, 1);
  });

  test('inkLightness wins over inkMix when both are given', () {
    expect(GlimTheme.light.copyWith(inkLightness: 0.6, inkMix: 1).inkLightness, 0.6);
  });

  test('a focusRing argument is accepted and the ring stays the accent ink', () {
    final theme = GlimTheme.light.copyWith(focusRing: const Color(0x8C8E6A00));
    expect(theme.focusRing, theme.accentInk);
    expect(theme.focusRing, GlimTheme.light.focusRing);
  });
}
