import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'engines.dart';
import 'engines.g.dart';
import 'glyphs.g.dart';

/// One glyph of the assortment: its name in glyphs.json, its box and its
/// paths, and its line drawing where it has one.
@immutable
class GlimGlyphData {
  const GlimGlyphData(this.name, this.viewBox, this.body, {this.line});

  final String name;
  final String viewBox;

  /// The SVG children, filled with currentColor.
  final String body;

  /// The line drawing from glyphs-line.json, in [glimLineViewBox]. A brand
  /// mark has none and stays filled in both styles.
  final String? line;

  /// The whole SVG in [style].
  String svg(GlimGlyphStyle style) => style == GlimGlyphStyle.line && line != null
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="$glimLineViewBox">$line</svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="$viewBox" fill="currentColor">$body</svg>';
}

/// Draws a glyph in the ambient [IconTheme] colour and size, as an [Icon]
/// does, in the style the glyph engine asks for.
class GlimGlyph extends StatelessWidget {
  const GlimGlyph(this.glyph, {super.key, this.size, this.color});

  final GlimGlyphData glyph;
  final double? size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final icon = IconTheme.of(context);
    final s = size ?? icon.size ?? 16;
    return SvgPicture.string(
      glyph.svg(GlimEngines.of(context).glyphs),
      width: s,
      height: s,
      theme: SvgTheme(currentColor: color ?? icon.color ?? const Color(0xFF000000)),
      excludeFromSemantics: true,
    );
  }
}
