import 'package:flutter/material.dart';

import 'engines.g.dart';

/// The light, glyph and motion engines the user picked, as a
/// [ThemeExtension] beside [GlimTheme]. The web keeps them on the root as
/// `data-light`, `data-glyphs` and `data-motion`.
@immutable
class GlimEngines extends ThemeExtension<GlimEngines> {
  const GlimEngines({this.light = glimDefaultLight, this.glyphs = glimDefaultGlyphs, this.motion = glimDefaultMotion});

  final GlimLight light;
  final GlimGlyphStyle glyphs;
  final GlimMotion motion;

  static GlimEngines of(BuildContext context) => Theme.of(context).extension<GlimEngines>() ?? const GlimEngines();

  /// What the light level draws on the theme's ramp.
  static GlimLighting lightingOf(BuildContext context) => of(context).light.on(Theme.of(context).brightness);

  /// The motion level to play. A system that asks for less motion gets off,
  /// except under storm, the one level that still animates there, as on the
  /// web.
  static GlimMotion motionOf(BuildContext context) {
    final motion = of(context).motion;
    final reduced = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    return reduced && motion != GlimMotion.storm ? GlimMotion.off : motion;
  }

  @override
  GlimEngines copyWith({GlimLight? light, GlimGlyphStyle? glyphs, GlimMotion? motion}) =>
      GlimEngines(light: light ?? this.light, glyphs: glyphs ?? this.glyphs, motion: motion ?? this.motion);

  @override
  GlimEngines lerp(GlimEngines? other, double t) => other == null || t < 0.5 ? this : other;
}

/// A CSS `linear()` easing: straight runs between the given points, which is
/// how the stylesheet writes a spring so the browser and the phone play the
/// same curve. [points] holds each point's time and value in turn.
class GlimLinearCurve extends Curve {
  const GlimLinearCurve(this.points);

  final List<double> points;

  @override
  double transformInternal(double t) {
    for (var i = 2; i < points.length; i += 2) {
      final (t0, v0, t1, v1) = (points[i - 2], points[i - 1], points[i], points[i + 1]);
      if (t <= t1) return t1 == t0 ? v1 : v0 + (v1 - v0) * (t - t0) / (t1 - t0);
    }
    return points.last;
  }
}
