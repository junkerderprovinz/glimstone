import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

void main() {
  group('light', () {
    test('edge is the look without a setting', () {
      expect(const GlimEngines().light, GlimLight.edge);
      expect(GlimLight.offered, [GlimLight.off, GlimLight.edge, GlimLight.glow]);
    });

    test('edge gives a raised surface a lit top edge and off takes it away', () {
      for (final b in Brightness.values) {
        final edge = GlimLight.edge.on(b).raised.where((s) => s.inset).toList();
        expect(edge, hasLength(1));
        expect(edge.single.offset, const Offset(0, 1));
        expect(edge.single.color.computeLuminance(), greaterThan(0.9));
        expect(GlimLight.off.on(b).raised.where((s) => s.inset), isEmpty);
        expect(GlimLight.off.on(b).control, isEmpty);
      }
    });

    test('only glow and stone let the accent fill and an on switch catch the light', () {
      for (final l in GlimLight.values) {
        final lit = l == GlimLight.glow || l == GlimLight.stone;
        expect(l.dark.sheen != null, lit, reason: l.name);
        expect(l.dark.sheenOn != null, lit, reason: l.name);
        expect(l.dark.accent.isNotEmpty, lit, reason: l.name);
      }
    });

    test('a window stands higher than a menu, and a menu higher than a card', () {
      double reach(List<GlimShadow> s) => s.where((x) => !x.inset).map((x) => x.offset.dy + x.blur).reduce((a, b) => a > b ? a : b);
      final dark = GlimLight.edge.dark;
      expect(reach(dark.modal), greaterThan(reach(dark.float)));
      expect(reach(dark.float), greaterThan(reach(dark.raised)));
    });
  });

  group('motion', () {
    test('subtle is the default and springs past its mark by under one per cent', () {
      expect(const GlimEngines().motion, GlimMotion.subtle);
      final spring = GlimMotion.subtle.spring;
      var peak = 0.0;
      for (var i = 0; i <= 1000; i++) {
        final v = spring.transform(i / 1000);
        if (v > peak) peak = v;
      }
      expect(peak, greaterThan(1));
      expect(peak, lessThan(1.01));
      expect(spring.transform(1), 1);
    });

    test('wild swings further and off does not move', () {
      expect(GlimMotion.wild.spring.transform(0.28), greaterThan(1.05));
      expect(GlimMotion.off.controlDur, Duration.zero);
      expect(GlimMotion.off.shapeDur, Duration.zero);
      expect(GlimMotion.subtle.controlDur, const Duration(milliseconds: 80));
      expect(GlimMotion.subtle.pageDur, const Duration(milliseconds: 220));
    });

    testWidgets('reduced motion stills every level but storm', (tester) async {
      for (final level in GlimMotion.values) {
        late GlimMotion seen;
        await tester.pumpWidget(MediaQuery(
          data: const MediaQueryData(disableAnimations: true),
          child: Theme(
            data: glimThemeData(Brightness.dark, motion: level),
            child: Builder(builder: (context) {
              seen = GlimEngines.motionOf(context);
              return const SizedBox();
            }),
          ),
        ));
        expect(seen, level == GlimMotion.storm ? GlimMotion.storm : GlimMotion.off, reason: level.name);
      }
    });
  });

  group('type', () {
    test('IBM Plex Sans is the house face, shipped with its licence, Noto behind it', () {
      expect(GlimType.family, 'IBM Plex Sans');
      expect(GlimType.fallback.first, 'Noto Sans');
      expect(File('fonts/IBMPlexSans.ttf').existsSync(), isTrue);
      expect(File('fonts/OFL.txt').readAsStringSync(), contains('SIL Open Font License'));
      expect(File('pubspec.yaml').readAsStringSync(), contains('family: IBM Plex Sans'));
    });

    test('the text theme sets three weights in Plex with a tracking per size', () {
      final text = glimThemeData(Brightness.dark).textTheme;
      final body = text.bodyMedium!;
      expect(body.fontFamily, glimFontFamily);
      expect(body.fontFamilyFallback, GlimType.fallback);
      expect(body.fontSize, GlimMetrics.textBody);
      expect(body.fontWeight, GlimType.regular);
      expect(body.letterSpacing, closeTo(GlimMetrics.textBody * GlimType.trackingBody, 1e-9));
      expect(text.labelLarge!.fontWeight, GlimType.medium);
      expect(text.headlineSmall!.fontWeight, GlimType.strong);
      expect(text.headlineSmall!.fontSize, GlimMetrics.textStatus);
      expect(text.labelSmall!.letterSpacing, closeTo(GlimMetrics.textMeta * GlimType.trackingMeta, 1e-9));
    });
  });

  test('corners nest: a well takes the card radius less the gap', () {
    expect(GlimShape.soft.nested, 8);
    expect(GlimShape.round.nested, 18);
    expect(GlimShape.square.nested, 0);
  });

  test('a state wash is its solid at a fixed share, deeper under the pointer', () {
    final g = GlimTheme.dark;
    expect(g.statusFailWash, g.statusFailSolid.withValues(alpha: 0.17));
    expect(g.statusFailWashHover, g.statusFailSolid.withValues(alpha: 0.26));
    expect(g.statusOkWash, g.statusOkSolid.withValues(alpha: 0.17));
  });

  group('fields', () {
    test('a field carries no line and no ring in any state', () {
      final f = glimThemeData(Brightness.dark).inputDecorationTheme;
      expect(f.filled, isTrue);
      for (final border in [f.border, f.enabledBorder, f.focusedBorder, f.errorBorder, f.focusedErrorBorder, f.disabledBorder]) {
        expect(border, isA<OutlineInputBorder>());
        expect((border! as OutlineInputBorder).borderSide, BorderSide.none);
      }
    });

    test('a field rests, hovers and focuses on its translucent steps, and a wrong value turns it red', () {
      for (final b in Brightness.values) {
        final g = glimThemeData(b).extension<GlimTheme>()!;
        final fill = glimThemeData(b).inputDecorationTheme.fillColor! as WidgetStateColor;
        expect(fill.resolve({}), g.fieldRest);
        expect(fill.resolve({WidgetState.hovered}), g.fieldHover);
        expect(fill.resolve({WidgetState.focused}), g.fieldFocus);
        expect(fill.resolve({WidgetState.focused, WidgetState.hovered}), g.fieldFocus);
        expect(fill.resolve({WidgetState.error}), g.fieldInvalid);
        expect(fill.resolve({WidgetState.error, WidgetState.focused}), g.fieldInvalidFocus);
        expect(g.fieldRest.a, lessThan(0.2));
      }
    });
  });

  test('menus, windows and bubbles float on their own surface over a lighter scrim', () {
    final data = glimThemeData(Brightness.dark);
    final g = data.extension<GlimTheme>()!;
    expect(data.dialogTheme.backgroundColor, g.surfaceOverlay);
    expect(data.dialogTheme.barrierColor, g.glimScrim);
    expect(data.popupMenuTheme.color, g.surfaceOverlay);
    expect(g.glimScrim.a, lessThan(0.6));
  });
}
