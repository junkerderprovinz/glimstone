import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:glimstone/glimstone.dart';

// What the colour picker can hand in, the same sweep as the core's
// tokenContrast test: twelve hues at low, mid and high chroma on four
// lightness steps, and a run of greys.
final sweep = <Color>[
  for (final l in [0.45, 0.6, 0.75, 0.9])
    for (final c in [0.02, 0.08, 0.2])
      for (var i = 0; i < 12; i++) fromOklab(l, c * math.cos(i * math.pi / 6), c * math.sin(i * math.pi / 6)),
  for (final g in [0x22, 0x55, 0x6B, 0x77, 0x7B, 0x88, 0x99, 0xBB, 0xDD]) Color.from(alpha: 1, red: g / 255, green: g / 255, blue: g / 255),
];

Color fromOklab(double lightness, double a, double b) {
  double cube(double v) => v * v * v;
  final l = cube(lightness + 0.3963377774 * a + 0.2158037573 * b);
  final m = cube(lightness - 0.1055613458 * a - 0.0638541728 * b);
  final s = cube(lightness - 0.0894841775 * a - 1.291485548 * b);
  double channel(double v) {
    final g = v <= 0.0031308 ? 12.92 * v : 1.055 * math.pow(v, 1 / 2.4) - 0.055;
    return (g.clamp(0.0, 1.0) * 255).round() / 255;
  }

  return Color.from(
    alpha: 1,
    red: channel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    green: channel(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    blue: channel(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  );
}

Color opaque(Color c) => Color.from(alpha: 1, red: (c.r * 255).round() / 255, green: (c.g * 255).round() / 255, blue: (c.b * 255).round() / 255);

double ratio(Color a, Color b) {
  final x = opaque(a).computeLuminance();
  final y = opaque(b).computeLuminance();
  return (math.max(x, y) + 0.05) / (math.min(x, y) + 0.05);
}

Color over(Color colour, Color ground) => Color.lerp(ground, colour.withValues(alpha: 1), colour.a)!;

String hex(Color c) => '#${[c.r, c.g, c.b].map((v) => (v * 255).round().toRadixString(16).padLeft(2, '0')).join().toUpperCase()}';

void main() {
  test('the sweep holds 153 colours', () => expect(sweep.length, 153));

  for (final (name, base) in [('light', GlimTheme.light), ('dark', GlimTheme.dark), ('OLED', GlimTheme.oled)]) {
    test('every picked accent keeps its fill ink, hover and text ink at 4.5:1 on $name', () {
      final misses = <String>[];
      for (final picked in sweep) {
        final g = base.withAccent(picked);
        void check(String what, Color ink, Color ground) {
          if (ratio(ink, ground) < glimMinTextContrast) misses.add('${hex(picked)} $what ${ratio(ink, ground).toStringAsFixed(2)}');
        }

        check('ink on the fill', g.accentContrast, g.accent);
        check('ink on the hover', g.accentContrast, g.accentHover);
        for (final ground in [g.carbonBg, g.carbonSidebar, g.carbonSurface]) {
          check('text on the ground', g.accentInk, ground);
        }
        check('text on the wash', g.accentInk, over(g.accentSoft, g.carbonSurface));
      }
      expect(misses, isEmpty);
    });
  }

  // The colours packages/core/src/contrast.ts hands out for the same accents.
  test('a picked accent gets the same colours as on the web', () {
    final light = GlimTheme.light;
    final dark = GlimTheme.dark;
    final cases = <(int, String, String, String, String?, String?)>[
      // accent, fill ink, light ink, dark ink, light hover, dark hover
      (0xFF777777, '#060606', '#696969', '#ABABAB', '#8B8B8B', null),
      (0xFF009E34, '#161616', '#007C27', '#75C07C', '#26AD52', null),
      (0xFF00A385, '#161616', '#007A64', '#6CBDA6', '#26B197', null),
      (0xFF1D99F3, '#161616', '#126DAF', '#62B1F8', null, null),
      (0xFF6B6B6B, '#FFFFFF', '#696969', '#ABABAB', null, '#5B5B5B'),
    ];
    for (final (accent, onFill, inkLight, inkDark, hoverLight, hoverDark) in cases) {
      final c = Color(accent);
      expect(hex(glimContrastOn(c)), onFill, reason: hex(c));
      expect(hex(light.withAccent(c).accentInk), inkLight, reason: hex(c));
      expect(hex(dark.withAccent(c).accentInk), inkDark, reason: hex(c));
      if (hoverLight != null) expect(hex(light.withAccent(c).accentHover), hoverLight, reason: hex(c));
      if (hoverDark != null) expect(hex(dark.withAccent(c).accentHover), hoverDark, reason: hex(c));
    }
  });
}
