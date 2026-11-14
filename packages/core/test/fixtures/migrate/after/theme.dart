import 'package:flutter/material.dart';
import 'package:glimstone/glimstone.dart';

final light = GlimTheme.light.copyWith(
  accent: const Color(0xFF1D99F3),
  inkLightness: 0.52,
);

final dark = GlimTheme.dark.copyWith(inkLightness: 0.74,);

double mixOf(GlimTheme theme) => theme.inkMix;
