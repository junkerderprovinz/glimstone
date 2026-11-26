import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

import 'support.dart';

GlimDecoration decorationOf(WidgetTester tester, Type type) =>
    tester.widget<DecoratedBox>(find.descendant(of: find.byType(type), matching: find.byType(DecoratedBox)).first).decoration as GlimDecoration;

void main() {
  testWidgets('the card carries the raised step of the light engine', (tester) async {
    for (final light in GlimLight.values) {
      await tester.pumpWidget(host(const GlimCard(child: Text('Backups')), light: light));
      await tester.pumpAndSettle();
      final card = decorationOf(tester, GlimCard);
      expect(card.shadows, light.dark.raised, reason: light.name);
      expect(card.color, GlimTheme.dark.stoneSurface);
    }
  });

  testWidgets('a well inside a card takes the nested corner and no shadow', (tester) async {
    for (final shape in GlimShape.values) {
      await tester.pumpWidget(host(const GlimCard(child: GlimWell(child: Text('Track'))), shape: shape));
      await tester.pumpAndSettle();
      final well = decorationOf(tester, GlimWell);
      expect(well.shadows, isEmpty);
      expect(well.color, GlimTheme.dark.stoneSurface2);
      expect((well.shape as OutlinedBorder), glimOutline(shape, shape.nested));
    }
  });

  test('corners are squircles outside round, and round keeps true circles', () {
    expect(glimOutline(GlimShape.soft, 14), isA<RoundedSuperellipseBorder>());
    expect(glimOutline(GlimShape.square, 0), isA<RoundedSuperellipseBorder>());
    expect(glimOutline(GlimShape.round, 24), isA<RoundedRectangleBorder>());
  });

  testWidgets('a shadow never shows under its own translucent surface', (tester) async {
    final key = GlobalKey();
    await tester.pumpWidget(Directionality(
      textDirection: TextDirection.ltr,
      child: Center(
        child: RepaintBoundary(
          key: key,
          child: Container(
            width: 80,
            height: 60,
            padding: const EdgeInsets.all(20),
            color: const Color(0xFFFFFFFF),
            child: const DecoratedBox(
              decoration: GlimDecoration(shadows: [GlimShadow(Color(0xFF000000), spread: 4)]),
              child: SizedBox.expand(),
            ),
          ),
        ),
      ),
    ));
    final image = await tester.runAsync(() async {
      final boundary = key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final picture = await boundary.toImage();
      return picture.toByteData();
    });
    int pixel(int x, int y) => image!.getUint8((y * 80 + x) * 4);
    expect(pixel(40, 30), 255, reason: 'inside the surface');
    expect(pixel(18, 30), 0, reason: 'in the spread');
    expect(pixel(4, 30), 255, reason: 'past the spread');
  });

  testWidgets('the grain covers the page only at the stone level', (tester) async {
    for (final light in GlimLight.values) {
      await tester.pumpWidget(host(const GlimGrain(child: SizedBox(width: 10, height: 10)), light: light));
      await tester.pumpAndSettle();
      final paint = tester.widget<CustomPaint>(find.descendant(of: find.byType(GlimGrain), matching: find.byType(CustomPaint)));
      expect(paint.foregroundPainter != null, light == GlimLight.stone, reason: light.name);
    }
  });
}
