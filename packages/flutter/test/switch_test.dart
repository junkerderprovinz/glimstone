import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

import 'support.dart';

// Each test is named after its contract row in site/src/contracts.ts.

class Flip extends StatefulWidget {
  const Flip({super.key, this.initial = false, this.hideLabel = false});

  final bool initial;
  final bool hideLabel;

  @override
  State<Flip> createState() => _FlipState();
}

class _FlipState extends State<Flip> {
  late bool on = widget.initial;

  @override
  Widget build(BuildContext context) =>
      GlimSwitch(label: 'Wi-Fi', value: on, hideLabel: widget.hideLabel, onChanged: (v) => setState(() => on = v));
}

Finder get knob => find.byKey(GlimSwitch.knobKey);
Finder get track => find.byKey(GlimSwitch.trackKey);

void main() {
  setUpAll(loadPlex);

  testWidgets('[toggle-role] it reports a toggled state matching its value', (tester) async {
    final semantics = tester.ensureSemantics();
    await tester.pumpWidget(host(const Flip(initial: true)));
    expect(tester.getSemantics(find.byType(GlimSwitch)), isSemantics(label: 'Wi-Fi', hasToggledState: true, isToggled: true));
    await tester.tap(track);
    await tester.pumpAndSettle();
    expect(tester.getSemantics(find.byType(GlimSwitch)), isSemantics(hasToggledState: true, isToggled: false));
    semantics.dispose();
  });

  for (final (id, key) in [('toggle-space', LogicalKeyboardKey.space), ('toggle-enter', LogicalKeyboardKey.enter)]) {
    testWidgets('[$id] the key flips it', (tester) async {
      await tester.pumpWidget(host(const Flip()));
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(key);
      await tester.pumpAndSettle();
      expect(tester.widget<GlimSwitch>(find.byType(GlimSwitch)).value, isTrue);
    });
  }

  testWidgets('[toggle-name] the label is the name, also with hideLabel', (tester) async {
    final semantics = tester.ensureSemantics();
    await tester.pumpWidget(host(const Flip(hideLabel: true)));
    expect(find.text('Wi-Fi'), findsNothing);
    expect(find.bySemanticsLabel('Wi-Fi'), findsOneWidget);
    semantics.dispose();
  });

  testWidgets('[toggle-disabled] a click changes nothing', (tester) async {
    await tester.pumpWidget(host(const GlimSwitch(label: 'Wi-Fi', value: false)));
    final before = tester.getRect(knob);
    await tester.tap(track);
    await tester.pumpAndSettle();
    expect(tester.getRect(knob), before);
  });

  for (final direction in TextDirection.values) {
    testWidgets('[toggle-knob-inset] the knob keeps 3px of track off, on and pressed, ${direction.name}', (tester) async {
      final rtl = direction == TextDirection.rtl;
      void inset(String when, {required bool on}) {
        final t = tester.getRect(track);
        final k = tester.getRect(knob);
        expect(k.top - t.top, 3, reason: when);
        expect(t.bottom - k.bottom, 3, reason: when);
        // The knob rests at the start when off and at the end when on.
        final atRight = on != rtl;
        expect(atRight ? t.right - k.right : k.left - t.left, 3, reason: when);
      }

      for (final on in [false, true]) {
        await tester.pumpWidget(host(Flip(key: ValueKey(on), initial: on), direction: direction));
        await tester.pumpAndSettle();
        inset(on ? 'on' : 'off', on: on);
        final rest = tester.getSize(knob).width;
        final press = await tester.startGesture(tester.getCenter(track));
        await tester.pumpAndSettle();
        expect(tester.getSize(knob).width, greaterThan(rest));
        inset(on ? 'on and pressed' : 'off and pressed', on: on);
        await press.cancel();
        await tester.pumpAndSettle();
      }
    });
  }

  testWidgets('[toggle-off-contrast] the off track holds 3:1 against the card and the knob in light', (tester) async {
    for (final accent in [GlimTheme.light.accent, const Color(0xFF1D99F3), const Color(0xFF777777)]) {
      final g = GlimTheme.light.withAccent(accent);
      expect(ratio(g.toggleOff, g.carbonSurface), greaterThanOrEqualTo(3), reason: hex(accent));
      expect(ratio(g.toggleOff, g.toggleKnob), greaterThanOrEqualTo(3), reason: hex(accent));
    }
  });

  testWidgets('the knob is the same in both states, white on light and dark stone on dark', (tester) async {
    Color knobColour() => (tester.widget<AnimatedContainer>(find.descendant(of: knob, matching: find.byType(AnimatedContainer))).decoration! as GlimDecoration).color!;
    for (final b in Brightness.values) {
      final g = glimThemeData(b).extension<GlimTheme>()!;
      for (final on in [false, true]) {
        await tester.pumpWidget(host(Flip(key: ValueKey(on), initial: on), brightness: b));
        await tester.pumpAndSettle();
        expect(knobColour(), g.toggleKnob);
      }
      expect(g.toggleKnob.computeLuminance() > 0.5, b == Brightness.light);
    }
  });

  testWidgets('an on switch catches the light only at glow', (tester) async {
    Gradient? sheen() => (tester.widget<AnimatedContainer>(find.descendant(of: track, matching: find.byType(AnimatedContainer)).first).decoration! as GlimDecoration).gradient;
    await tester.pumpWidget(host(const Flip(initial: true), light: GlimLight.glow));
    await tester.pumpAndSettle();
    expect(sheen(), GlimLight.glow.dark.sheenOn);
    await tester.pumpWidget(host(const Flip(initial: true)));
    await tester.pumpAndSettle();
    expect(sheen(), isNull);
  });
}
