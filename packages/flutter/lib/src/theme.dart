import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'engines.dart';
import 'engines.g.dart';
import 'paint.dart';
import 'tokens.g.dart';

/// The tokens tokens.css derives, worked out the same way.
extension GlimDerived on GlimTheme {
  /// A filled control hovers toward the text colour (rule 21). Where that step
  /// would take the fill's ink under 4.5:1, as on a mid-grey picked accent,
  /// the hover takes the same step away from the ink, as applyAccent does on
  /// the web.
  Color get accentHover {
    final toward = Color.lerp(accent, stoneText, _hoverStep)!;
    final ink = glimContrastOn(accent);
    if (_ratio(_rgb(ink), _rounded(_rgb(toward))) >= glimMinTextContrast) return toward;
    final away = _luminance(_rgb(ink)) > _luminance(_rgb(accent)) ? _black : _white;
    return _color(_mix(_rgb(accent), away, _hoverStep));
  }

  @Deprecated('A state button is a wash: statusOkWash under statusOkText, hovering to statusOkWashHover. statusOkHover goes in 6.0.0.')
  Color get statusOkHover => Color.lerp(statusOkSolid, stoneText, _hoverStep)!;
  @Deprecated('A state button is a wash: statusFailWash under statusFailText, hovering to statusFailWashHover. statusFailHover goes in 6.0.0.')
  Color get statusFailHover => Color.lerp(statusFailSolid, stoneText, _hoverStep)!;
  @Deprecated('A state button is a wash: statusWarnWash under statusWarnText, hovering to statusWarnWashHover. statusWarnHover goes in 6.0.0.')
  Color get statusWarnHover => Color.lerp(statusWarnSolid, stoneText, _hoverStep)!;

  /// The accent as text on the page's ground: moved in OKLab onto the ramp's
  /// lightness step, darker on a light ramp and lighter on a dark one, as
  /// tokens.css does. Where that still misses 4.5:1 on the card or on the
  /// accent's own wash there, it goes on toward black or white until it reads,
  /// as applyAccent does on the web.
  Color get accentInk {
    final onLight = ramp == GlimRamp.light;
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

  /// The ground of whatever the pointer is over, a button, a row, a menu
  /// entry or a tile: a small step darker than [stoneSurface3], in the
  /// accent's hue, as `--hover`.
  Color get hover {
    final lab = _oklab(accent);
    return _srgb(ramp.hover, lab[1] * glimHoverChroma, lab[2] * glimHoverChroma);
  }

  /// The ramp this theme stands on, told apart by its ground.
  GlimRamp get ramp => stoneGround == const Color(0xFF000000)
      ? GlimRamp.oled
      : stoneGround.computeLuminance() > 0.5
          ? GlimRamp.light
          : GlimRamp.dark;

  /// This theme with a picked accent: the stone tinted by it, and its fill
  /// ink and its wash worked out the way applyAccent does on the web.
  GlimTheme withAccent(Color picked) => stoneOn(picked).copyWith(
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

/// A stone step on [accent]'s hue: OKLCH [lightness] with [share] of the
/// accent's chroma, at most [cap], as `oklch(from var(--accent) ...)` in
/// tokens.css.
Color glimStone(Color accent, double lightness, double share, double cap) {
  final lab = _oklab(accent);
  final chroma = math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
  if (chroma == 0) return _srgb(lightness, 0, 0);
  final k = math.min(chroma * share, cap) / chroma;
  return _srgb(lightness, lab[1] * k, lab[2] * k);
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

/// The house face as Flutter names a font that a package ships.
const glimFontFamily = 'packages/glimstone/${GlimType.family}';

/// A [ThemeData] that carries GlimStone's colours and engines, for an app that
/// has none of its own yet. An app with a theme adds [GlimTheme.dark] or
/// [GlimTheme.light] and a [GlimEngines] to its own `extensions` instead.
/// [oled] puts the dark theme on true black and leaves the light one as it is.
/// [accent] tints the stone and the fills as a picked colour does on the web.
ThemeData glimThemeData(
  Brightness brightness, {
  GlimShape shape = GlimShape.soft,
  bool oled = false,
  Color? accent,
  GlimLight light = glimDefaultLight,
  GlimGlyphStyle glyphs = glimDefaultGlyphs,
  GlimMotion motion = glimDefaultMotion,
}) {
  final dark = oled ? GlimTheme.oled : GlimTheme.dark;
  var glim = (brightness == Brightness.dark ? dark : GlimTheme.light).copyWith(shape: shape);
  if (accent != null) glim = glim.withAccent(accent);
  final lit = light.on(brightness);

  TextStyle type(double size, double tracking, FontWeight weight, [Color? color]) => TextStyle(
        fontFamily: glimFontFamily,
        fontFamilyFallback: GlimType.fallback,
        fontSize: size,
        letterSpacing: size * tracking,
        fontWeight: weight,
        // A variable face takes its weight from the axis, not from the name.
        fontVariations: [FontVariation.weight(weight.value.toDouble())],
        color: color ?? glim.stoneText,
      );
  final body = type(GlimMetrics.textBody, GlimType.trackingBody, GlimType.regular);
  final noLine = OutlineInputBorder(borderSide: BorderSide.none, borderRadius: BorderRadius.circular(shape.control));

  return ThemeData(
    brightness: brightness,
    scaffoldBackgroundColor: glim.stoneGround,
    colorScheme: ColorScheme.fromSeed(seedColor: glim.accent, brightness: brightness, surface: glim.stoneSurface).copyWith(
      primary: glim.accent,
      onPrimary: glim.accentContrast,
      onSurface: glim.stoneText,
      error: glim.statusFailText,
    ),
    fontFamily: glimFontFamily,
    fontFamilyFallback: GlimType.fallback,
    textTheme: TextTheme(
      headlineSmall: type(GlimMetrics.textStatus, GlimType.trackingStatus, GlimType.strong),
      titleMedium: type(GlimMetrics.textTitle, GlimType.trackingTitle, GlimType.strong),
      titleSmall: type(GlimMetrics.textBody, GlimType.trackingBody, GlimType.medium),
      bodyLarge: body,
      bodyMedium: body,
      bodySmall: type(GlimMetrics.textSubline, GlimType.trackingSubline, GlimType.regular, glim.stoneTextSub),
      labelLarge: type(GlimMetrics.textBody, GlimType.trackingBody, GlimType.medium),
      labelMedium: type(GlimMetrics.textSubline, GlimType.trackingSubline, GlimType.medium),
      labelSmall: type(GlimMetrics.textMeta, GlimType.trackingMeta, GlimType.medium),
    ),
    hoverColor: glim.hover,
    // Rule 14: a field sits a little into its surface on translucent steps and
    // never carries a line or a ring. Focus is its brightest step.
    inputDecorationTheme: InputDecorationThemeData(
      filled: true,
      fillColor: WidgetStateColor.resolveWith((states) {
        final focused = states.contains(WidgetState.focused);
        if (states.contains(WidgetState.error)) return focused ? glim.fieldInvalidFocus : glim.fieldInvalid;
        if (focused) return glim.fieldFocus;
        if (states.contains(WidgetState.hovered)) return glim.fieldHover;
        return glim.fieldRest;
      }),
      hoverColor: Colors.transparent,
      hintStyle: body.copyWith(color: glim.fieldPlaceholder),
      isDense: true,
      constraints: const BoxConstraints(minHeight: GlimMetrics.btnH),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      border: noLine,
      enabledBorder: noLine,
      focusedBorder: noLine,
      errorBorder: noLine,
      focusedErrorBorder: noLine,
      disabledBorder: noLine,
    ),
    textSelectionTheme: TextSelectionThemeData(
      cursorColor: glim.accentInk,
      selectionColor: glim.selection,
      selectionHandleColor: glim.accentInk,
    ),
    cardTheme: CardThemeData(
      color: glim.stoneSurface,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shape: glimOutline(shape, shape.card),
    ),
    // What floats over a card stands on a surface of its own, over a scrim
    // light enough to show where it came from.
    dialogTheme: DialogThemeData(
      backgroundColor: glim.surfaceOverlay,
      surfaceTintColor: Colors.transparent,
      barrierColor: glim.glimScrim,
      shape: glimOutline(shape, shape.card),
    ),
    popupMenuTheme: PopupMenuThemeData(
      color: glim.surfaceOverlay,
      surfaceTintColor: Colors.transparent,
      shape: glimOutline(shape, shape.control),
    ),
    tooltipTheme: TooltipThemeData(
      decoration: GlimDecoration(color: glim.surfaceOverlay, shape: glimOutline(shape, shape.control), shadows: lit.float),
      textStyle: type(GlimMetrics.textMeta, GlimType.trackingMeta, GlimType.regular),
    ),
    scrollbarTheme: ScrollbarThemeData(thumbColor: WidgetStatePropertyAll(glim.scrollbarThumb)),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStatePropertyAll(glim.toggleKnob),
      trackColor: WidgetStateColor.resolveWith((states) => states.contains(WidgetState.selected) ? glim.accent : glim.toggleOff),
      trackOutlineColor: const WidgetStatePropertyAll(Colors.transparent),
    ),
    extensions: [glim, GlimEngines(light: light, glyphs: glyphs, motion: motion)],
  );
}
