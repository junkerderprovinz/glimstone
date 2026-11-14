import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'tokens.g.dart';

/// The tokens tokens.css derives, worked out the same way.
extension GlimDerived on GlimTheme {
  /// A filled control hovers toward the text colour (rule 21). Where that step
  /// would take the fill's ink under 4.5:1, as on a mid-grey picked accent,
  /// the hover takes the same step away from the ink, as applyAccent does on
  /// the web.
  Color get accentHover {
    final toward = Color.lerp(accent, carbonText, _hoverStep)!;
    final ink = glimContrastOn(accent);
    if (_ratio(_rgb(ink), _rounded(_rgb(toward))) >= glimMinTextContrast) return toward;
    final away = _luminance(_rgb(ink)) > _luminance(_rgb(accent)) ? _black : _white;
    return _color(_mix(_rgb(accent), away, _hoverStep));
  }

  Color get statusOkHover => Color.lerp(statusOkSolid, carbonText, _hoverStep)!;
  Color get statusFailHover => Color.lerp(statusFailSolid, carbonText, _hoverStep)!;
  Color get statusWarnHover => Color.lerp(statusWarnSolid, carbonText, _hoverStep)!;

  /// The accent as text on the page's ground: moved in OKLab onto the ramp's
  /// lightness step, darker on a light ramp and lighter on a dark one, as
  /// tokens.css does. Where that still misses 4.5:1 on the card or on the
  /// accent's own wash there, it goes on toward black or white until it reads,
  /// as applyAccent does on the web.
  Color get accentInk {
    final onLight = carbonBg.computeLuminance() > 0.5;
    final lab = _oklab(accent);
    final l = lab[0];
    var ink = accent;
    if (onLight ? l > inkLightness : l < inkLightness) {
      final k = onLight ? inkLightness / l : (1 - inkLightness) / (1 - l);
      ink = _srgb(inkLightness, lab[1] * k, lab[2] * k);
    }
    final card = onLight ? _white : _darkCard;
    final wash = _rounded(_mix(card, _rgb(accent), _softShare));
    final from = _rgb(ink);
    if (math.min(_ratio(from, card), _ratio(from, wash)) >= glimMinTextContrast) return ink;
    return _color(_pushed(from, onLight ? _black : _white, wash));
  }

  /// The focus ring, the accent ink at full strength.
  Color get focusRing => accentInk;

  /// This theme with a picked accent, its fill ink and its wash worked out
  /// the way applyAccent does on the web.
  GlimTheme withAccent(Color picked) => copyWith(
        accent: picked,
        accentContrast: glimContrastOn(picked),
        accentSoft: picked.withValues(alpha: _softShare),
      );
}

/// The ratio body text needs, and the floor of every ink worked out here.
const glimMinTextContrast = 4.5;

/// The ink for text or a glyph on a fill: white or Carbon's near-black,
/// whichever reads better, and on the mid-tones where neither reaches 4.5:1,
/// the near-black pushed toward black until it does. The same as contrastOn
/// in the core.
Color glimContrastOn(Color fill) {
  final f = _rgb(fill);
  final onWhite = _ratio(f, _white);
  final onDark = _ratio(f, _darkInk);
  if (onWhite > onDark && onWhite >= glimMinTextContrast) return const Color(0xFFFFFFFF);
  if (onDark >= glimMinTextContrast) return const Color(0xFF161616);
  return _color(_pushed(_darkInk, _black, f));
}

// The hover's step, color-mix(accent 85%, text) in tokens.css, and the share
// of the accent in --accent-soft.
const _hoverStep = 0.15;
const _softShare = 0.14;

// Channels from 0 to 255, as the core's contrast.ts counts them.
const _white = [255.0, 255.0, 255.0];
const _black = [0.0, 0.0, 0.0];
const _darkInk = [22.0, 22.0, 22.0];
const _darkCard = [38.0, 38.0, 38.0];

List<double> _rgb(Color c) => [for (final v in [c.r, c.g, c.b]) (v * 255).roundToDouble()];

List<double> _rounded(List<double> c) => [for (final v in c) v.roundToDouble()];

Color _color(List<double> c) => Color.from(
      alpha: 1,
      red: c[0].round() / 255,
      green: c[1].round() / 255,
      blue: c[2].round() / 255,
    );

List<double> _mix(List<double> from, List<double> to, double t) => [for (var i = 0; i < 3; i++) from[i] + (to[i] - from[i]) * t];

double _luminance(List<double> c) {
  double lin(double v) => _linear(v / 255);
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
}

double _ratio(List<double> a, List<double> b) {
  final x = _luminance(a);
  final y = _luminance(b);
  return (math.max(x, y) + 0.05) / (math.min(x, y) + 0.05);
}

// `from` moved toward `to` just far enough to reach 4.5:1 on `ground`, found
// by halving as contrast.ts does, so both sides land on the same colour.
List<double> _pushed(List<double> from, List<double> to, List<double> ground) {
  var lo = 0.0;
  var hi = 1.0;
  for (var i = 0; i < 16; i++) {
    final mid = (lo + hi) / 2;
    if (_ratio(_rounded(_mix(from, to, mid)), ground) >= glimMinTextContrast) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return _mix(from, to, hi);
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
