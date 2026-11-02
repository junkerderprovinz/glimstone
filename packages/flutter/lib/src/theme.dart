import 'package:flutter/material.dart';

import 'tokens.g.dart';

/// The tokens tokens.css derives with color-mix, worked out the same way.
extension GlimDerived on GlimTheme {
  /// A filled control hovers toward the text colour (rule 21).
  Color get accentHover => Color.lerp(accent, carbonText, 0.15)!;
  Color get statusOkHover => Color.lerp(statusOkSolid, carbonText, 0.15)!;
  Color get statusFailHover => Color.lerp(statusFailSolid, carbonText, 0.15)!;
  Color get statusWarnHover => Color.lerp(statusWarnSolid, carbonText, 0.15)!;

  /// The accent as text on the page's ground.
  Color get accentInk => Color.lerp(const Color(0xFF000000), accent, inkMix)!;
}

/// A [ThemeData] that carries GlimStone's colours, for an app that has none
/// of its own yet. An app with a theme adds [GlimTheme.dark] or
/// [GlimTheme.light] to its own `extensions` instead.
ThemeData glimThemeData(Brightness brightness, {GlimShape shape = GlimShape.soft}) {
  final glim = (brightness == Brightness.dark ? GlimTheme.dark : GlimTheme.light).copyWith(shape: shape);
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
