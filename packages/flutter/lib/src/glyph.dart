import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// One glyph of the assortment: its name in glyphs.json, its box and its paths.
@immutable
class GlimGlyphData {
  const GlimGlyphData(this.name, this.viewBox, this.body);

  final String name;
  final String viewBox;

  /// The SVG children, filled with currentColor.
  final String body;
}

/// Draws a glyph in the ambient [IconTheme] colour and size, as an [Icon] does.
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
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="${glyph.viewBox}" fill="currentColor">${glyph.body}</svg>',
      width: s,
      height: s,
      theme: SvgTheme(
          currentColor: color ?? icon.color ?? const Color(0xFF000000)),
      excludeFromSemantics: true,
    );
  }
}
