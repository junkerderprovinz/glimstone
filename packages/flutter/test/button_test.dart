import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

import 'support.dart';

// Each test is named after its contract row in site/src/contracts.ts, "[id] ...",
// which is how the site finds its result.

GlimDecoration groundOf(WidgetTester tester) =>
    tester.widget<AnimatedContainer>(find.byType(AnimatedContainer)).decoration! as GlimDecoration;

void main() {
  setUpAll(loadPlex);

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
    Color ground() => groundOf(tester).color!;
    final rest = ground();
    final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    await mouse.addPointer(location: tester.getCenter(find.byType(GlimButton)));
    await tester.pumpAndSettle();
    final lit = ground();
    final glim = GlimTheme.dark;
    expect(lit, isNot(rest));
    expect(lit, glim.hover);
    await mouse.removePointer();
  });

  testWidgets('a state button is a wash of its hue under the hue''s own text', (tester) async {
    final glim = GlimTheme.dark;
    for (final (tone, wash, hover, ink) in [
      (GlimTone.ok, glim.statusOkWash, glim.statusOkWashHover, glim.statusOkText),
      (GlimTone.danger, glim.statusFailWash, glim.statusFailWashHover, glim.statusFailText),
      (GlimTone.warn, glim.statusWarnWash, glim.statusWarnWashHover, glim.statusWarnText),
    ]) {
      await tester.pumpWidget(host(GlimButton(label: 'Delete', tone: tone, onPressed: () {})));
      expect(groundOf(tester).color, wash, reason: tone.name);
      expect(tester.widget<Text>(find.text('Delete')).style!.color, ink, reason: tone.name);
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await mouse.addPointer(location: tester.getCenter(find.byType(GlimButton)));
      await tester.pumpAndSettle();
      expect(groundOf(tester).color, hover, reason: tone.name);
      await mouse.removePointer();
    }
  });

  testWidgets('the focus ring is the accent ink, standing off the button', (tester) async {
    await tester.pumpWidget(host(GlimButton(label: 'Save', onPressed: () {})));
    GlimFocusRing ring() => tester.widget<GlimFocusRing>(find.byType(GlimFocusRing));
    expect(ring().visible, isFalse);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    expect(ring().visible, isTrue);
    expect(ring().color, GlimTheme.dark.focusRing);
    expect(ring().gap, 2);
    expect(ring().width, glimFocusRingWidth);
    expect(groundOf(tester).color, GlimTheme.dark.hover);
  });

  testWidgets('a button is a pill only in the round shape', (tester) async {
    for (final shape in GlimShape.values) {
      await tester.pumpWidget(host(GlimButton(label: 'Save', onPressed: () {}), shape: shape));
      await tester.pumpAndSettle();
      expect(groundOf(tester).shape, glimOutline(shape, shape.pill), reason: shape.name);
    }
    expect(GlimShape.soft.pill, GlimShape.soft.control);
  });

  testWidgets('the accent fill catches the light at glow and the neutral one takes the lit edge', (tester) async {
    for (final light in GlimLight.values) {
      await tester.pumpWidget(host(GlimButton(label: 'Save', tone: GlimTone.accent, onPressed: () {}), light: light));
      await tester.pumpAndSettle();
      expect(groundOf(tester).gradient, light.dark.sheen, reason: light.name);
      expect(groundOf(tester).shadows, light.dark.accent, reason: light.name);
      await tester.pumpWidget(host(GlimButton(label: 'Refresh', onPressed: () {}), light: light));
      await tester.pumpAndSettle();
      expect(groundOf(tester).shadows, light.dark.control, reason: light.name);
    }
  });

  testWidgets('the button moves on the motion engine', (tester) async {
    await tester.pumpWidget(host(GlimButton(label: 'Save', onPressed: () {})));
    final box = tester.widget<AnimatedContainer>(find.byType(AnimatedContainer));
    expect(box.duration, GlimMotion.subtle.controlDur);
    expect(box.curve, GlimMotion.subtle.ease);
  });
}
