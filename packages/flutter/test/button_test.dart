import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

// Each test is named after its contract row in site/src/contracts.ts, "[id] ...",
// which is how the site finds its result.

// Widths are measured in the house font; the test font draws every letter as a
// square, so no label would fit its stage.
Future<void> loadNotoSans() async {
  final bytes = File('example/fonts/NotoSans.ttf').readAsBytesSync();
  await (FontLoader('Noto Sans')..addFont(Future.value(ByteData.sublistView(bytes)))).load();
}

Widget host(Widget child, {Brightness brightness = Brightness.dark}) =>
    MaterialApp(
      theme: glimThemeData(brightness),
      home: Scaffold(body: Center(child: child)),
    );

void main() {
  setUpAll(loadNotoSans);

  testWidgets('[button-keys] Enter and Space act', (tester) async {
    var presses = 0;
    await tester.pumpWidget(host(GlimButton(
        label: 'Delete snapshot',
        glyph: GlimGlyphs.trash,
        onPressed: () => presses++)));
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    for (final key in [LogicalKeyboardKey.enter, LogicalKeyboardKey.space]) {
      await tester.sendKeyEvent(key);
      await tester.pump();
    }
    expect(presses, 2);
  });

  testWidgets('[button-name] the label stays the name in glyph mode',
      (tester) async {
    final semantics = tester.ensureSemantics();
    await tester.pumpWidget(host(GlimButton(
        label: 'Save',
        glyph: GlimGlyphs.save,
        mode: GlimLabelMode.glyph,
        onPressed: () {})));
    expect(find.bySemanticsLabel('Save'), findsOneWidget);
    expect(find.text('Save'), findsNothing);
    semantics.dispose();
  });

  testWidgets(
    '[button-width] the width does not move between text and text with glyph',
    (tester) async {
      const tones = {
        'Save': GlimGlyphs.save,
        'Refresh': GlimGlyphs.retry,
        'Copy': GlimGlyphs.copy,
        'Restore': GlimGlyphs.restore,
        'Delete': GlimGlyphs.trash,
        'Upload': GlimGlyphs.upload,
      };
      Future<List<double>> widths(GlimLabelMode mode) async {
        await tester.pumpWidget(host(Wrap(children: [
          for (final e in tones.entries)
            GlimButton(
                label: e.key, glyph: e.value, mode: mode, onPressed: () {}),
        ])));
        return [
          for (final b in tester.widgetList(find.byType(GlimButton)))
            tester.getSize(find.byWidget(b)).width
        ];
      }

      final text = await widths(GlimLabelMode.text);
      expect(await widths(GlimLabelMode.textGlyph), text);
      final glyph = await widths(GlimLabelMode.glyph);
      for (var i = 0; i < text.length; i++) {
        expect(glyph[i], lessThan(text[i]));
      }
    },
  );

  testWidgets('[button-busy] busy keeps the width and says so', (tester) async {
    final semantics = tester.ensureSemantics();
    await tester.pumpWidget(host(GlimButton(
        label: 'Back up now', glyph: GlimGlyphs.backupNow, onPressed: () {})));
    final before = tester.getSize(find.byType(GlimButton)).width;
    await tester.pumpWidget(host(GlimButton(
        label: 'Back up now',
        glyph: GlimGlyphs.backupNow,
        busy: true,
        onPressed: () {})));
    expect(tester.getSize(find.byType(GlimButton)).width, before);
    expect(tester.getSemantics(find.bySemanticsLabel('Back up now')).value,
        'Busy');
    semantics.dispose();
  });

  testWidgets(
      '[button-tint] a surface button takes the accent under the pointer',
      (tester) async {
    await tester.pumpWidget(host(GlimButton(
        label: 'Refresh', glyph: GlimGlyphs.retry, onPressed: () {})));
    Color ground() => ((tester
            .widget<AnimatedContainer>(find.byType(AnimatedContainer))
            .decoration!) as BoxDecoration)
        .color!;
    final rest = ground();
    final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    await mouse.addPointer(location: tester.getCenter(find.byType(GlimButton)));
    await tester.pumpAndSettle();
    final lit = ground();
    final glim = GlimTheme.dark;
    expect(lit, isNot(rest));
    expect(lit, Color.lerp(glim.carbonHoverRaised, glim.accentInk, 0.22));
    await mouse.removePointer();
  });
}
