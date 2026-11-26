import 'package:flutter/material.dart';
import 'package:glimstone/glimstone.dart';

Color ground(GlimTheme g) => g.carbonBg;

final tinted = GlimTheme.dark.copyWith(carbonSurface2: Colors.black, carbonTextSub: Colors.white);

BoxDecoration row(GlimTheme g, bool lit) => BoxDecoration(color: lit ? g.carbonHover : g.carbonSurface);

Color danger(GlimTheme g) => g.statusFailHover;

Color raised(GlimTheme g) => g.carbonHoverRaised;

final calm = GlimTheme.light.copyWith(
  statusOkBg: Colors.green,
  statusWarnBgSoft: Colors.orange.withValues(alpha: 0.1),
  accent: Colors.teal,
);
