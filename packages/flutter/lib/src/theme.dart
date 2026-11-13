import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'tokens.g.dart';

/// The tokens tokens.css derives, worked out the same way.
extension GlimDerived on GlimTheme {
  /// A filled control hovers toward the text colour (rule 21).
  Color get accentHover => Color.lerp(accent, carbonText, 0.15)!;
  Color get statusOkHover => Color.lerp(statusOkSolid, carbonText, 0.15)!;
  Color get statusFailHover => Color.lerp(statusFailSolid, carbonText, 0.15)!;
  Color get statusWarnHover => Color.lerp(statusWarnSolid, carbonText, 0.15)!;

  /// The accent as text on the page's ground: moved in OKLab onto the ramp's
  /// lightness step, darker on a light ramp and lighter on a dark one, as
  /// tokens.css does.
  Color get accentInk {
    final lab = _oklab(accent);
    final onLight = carbonBg.computeLuminance() > 0.5;
    final l = lab[0];
    if (onLight ? l <= inkLightness : l >= inkLightness) return accent;
    final k = onLight ? inkLightness / l : (1 - inkLightness) / (1 - l);
    return _srgb(inkLightness, lab[1] * k, lab[2] * k);
  }

  /// The focus ring, the accent ink at full strength.
  Color get focusRing => accentInk;
}

double _linear(double v) => v <= 0.04045 ? v / 12.92 : math.pow((v + 0.055) / 1.055, 2.4).toDouble();

double _gamma(double v) {
  final g = v <= 0.0031308 ? 12.92 * v : 1.055 * math.pow(v, 1 / 2.4) - 0.055;
  return g.clamp(0.0, 1.0).toDouble();
}

double _cbrt(double v) => v < 0 ? -math.pow(-v, 1 / 3).toDouble() : math.pow(v, 1 / 3).toDouble();

List<double> _oklab(Color c) {
  final r = _linear(c.r);
  final g = _linear(c.g);
  final b = _linear(c.b);
  final l = _cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  final m = _cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  final s = _cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

Color _srgb(double lightness, double a, double b) {
  final l = math.pow(lightness + 0.3963377774 * a + 0.2158037573 * b, 3).toDouble();
  final m = math.pow(lightness - 0.1055613458 * a - 0.0638541728 * b, 3).toDouble();
  final s = math.pow(lightness - 0.0894841775 * a - 1.291485548 * b, 3).toDouble();
  // Rounded to whole channels, as the web paints them.
  double channel(double v) => (_gamma(v) * 255).round() / 255;
  return Color.from(
    alpha: 1,
    red: channel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    green: channel(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    blue: channel(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  );
}

/// A [ThemeData] that carries GlimStone's colours, for an app that has none
/// of its own yet. An app with a theme adds [GlimTheme.dark] or
/// [GlimTheme.light] to its own `extensions` instead. [oled] puts the dark
/// theme on true black and leaves the light one as it is.
ThemeData glimThemeData(Brightness brightness, {GlimShape shape = GlimShape.soft, bool oled = false}) {
  final dark = oled ? GlimTheme.oled : GlimTheme.dark;
  final glim = (brightness == Brightness.dark ? dark : GlimTheme.light).copyWith(shape: shape);
  return ThemeData(
    brightness: brightness,
    scaffoldBackgroundColor: glim.carbonBg,
    colorScheme: ColorScheme.fromSeed(
        seedColor: glim.accent,
        brightness: brightness,
        surface: glim.carbonSurface),
    fontFamily: 'Noto Sans',
    extensions: [glim],
  );
}
