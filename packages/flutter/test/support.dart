import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:glimstone/glimstone.dart';

// Widths are measured in the house font. The test font draws every letter as a
// square, so no label would fit its stage.
Future<void> loadPlex() async {
  final bytes = File('fonts/IBMPlexSans.ttf').readAsBytesSync();
  await (FontLoader(glimFontFamily)..addFont(Future.value(ByteData.sublistView(bytes)))).load();
}

Widget host(
  Widget child, {
  Brightness brightness = Brightness.dark,
  GlimShape shape = GlimShape.soft,
  GlimLight light = glimDefaultLight,
  TextDirection direction = TextDirection.ltr,
}) =>
    MaterialApp(
      theme: glimThemeData(brightness, shape: shape, light: light),
      home: Directionality(
        textDirection: direction,
        child: Scaffold(body: Center(child: child)),
      ),
    );

String hex(Color c) => '#${[c.r, c.g, c.b].map((v) => (v * 255).round().toRadixString(16).padLeft(2, '0')).join().toUpperCase()}';

double ratio(Color a, Color b) {
  final x = a.computeLuminance();
  final y = b.computeLuminance();
  return (math.max(x, y) + 0.05) / (math.min(x, y) + 0.05);
}
