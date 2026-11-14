import 'package:flutter/material.dart';
import 'package:glimstone/glimstone.dart';

final light = GlimTheme.light.copyWith(
  accent: const Color(0xFF1D99F3),
  inkMix: 0.55,
  focusRing: const Color(0x8C1D99F3),
);

final dark = GlimTheme.dark.copyWith(inkMix: 1, focusRing: Colors.amber,);

double mixOf(GlimTheme theme) => theme.inkMix;
