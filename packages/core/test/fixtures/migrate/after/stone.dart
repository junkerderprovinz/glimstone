import 'package:flutter/material.dart';
import 'package:glimstone/glimstone.dart';

Color ground(GlimTheme g) => g.stoneGround;

final tinted = GlimTheme.dark.copyWith(stoneSurface2: Colors.black, stoneTextSub: Colors.white);

BoxDecoration row(GlimTheme g, bool lit) => BoxDecoration(color: lit ? g.carbonHover : g.stoneSurface);

Color danger(GlimTheme g) => g.statusFailHover;

Color raised(GlimTheme g) => g.stoneHoverRaised;

final calm = GlimTheme.light.copyWith(
  accent: Colors.teal,
);
