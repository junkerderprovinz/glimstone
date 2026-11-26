import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

void main() {
  test('a glyph is drawn filled by default', () {
    expect(const GlimEngines().glyphs, GlimGlyphStyle.filled);
    final svg = GlimGlyphs.eye.svg(GlimGlyphStyle.filled);
    expect(svg, contains('viewBox="${GlimGlyphs.eye.viewBox}"'));
    expect(svg, contains('fill="currentColor"'));
  });

  test('the line style draws the Lucide line on its own grid in the core stroke', () {
    final svg = GlimGlyphs.eye.svg(GlimGlyphStyle.line);
    expect(svg, contains('viewBox="$glimLineViewBox"'));
    expect(svg, contains('stroke="currentColor"'));
    expect(svg, contains('stroke-width="1.75"'));
    expect(svg, contains('fill="none"'));
  });

  test('a glyph without a line drawing, such as a brand mark, stays filled', () {
    final mark = GlimGlyphs.byName.values.firstWhere((g) => g.line == null);
    expect(mark.svg(GlimGlyphStyle.line), mark.svg(GlimGlyphStyle.filled));
  });

  testWidgets('a glyph follows the glyph engine of its theme', (tester) async {
    late GlimGlyphStyle seen;
    await tester.pumpWidget(MaterialApp(
      theme: glimThemeData(Brightness.dark, glyphs: GlimGlyphStyle.line),
      home: Builder(builder: (context) {
        seen = GlimEngines.of(context).glyphs;
        return const GlimGlyph(GlimGlyphs.eye);
      }),
    ));
    expect(seen, GlimGlyphStyle.line);
  });
}
