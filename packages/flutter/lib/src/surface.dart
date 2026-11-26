import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import 'engines.dart';
import 'engines.g.dart';
import 'paint.dart';
import 'tokens.g.dart';

GlimTheme _glim(BuildContext context) => Theme.of(context).extension<GlimTheme>() ?? GlimTheme.dark;

/// The one raised surface. It carries the elevation itself, lit by the light
/// engine. Never nest it (rule 1), put a [GlimWell] inside instead.
class GlimCard extends StatelessWidget {
  const GlimCard({super.key, required this.child, this.padding = const EdgeInsets.all(20)});

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final glim = _glim(context);
    return DecoratedBox(
      decoration: GlimDecoration(
        color: glim.stoneSurface,
        shape: glimOutline(glim.shape, glim.shape.card),
        shadows: GlimEngines.lightingOf(context).raised,
      ),
      child: Padding(padding: padding, child: child),
    );
  }
}

/// An inset well for tracks, drop zones and quiet groupings. Its corner nests
/// in the card's, so the two curves run side by side.
class GlimWell extends StatelessWidget {
  const GlimWell({super.key, required this.child, this.padding = const EdgeInsets.all(12)});

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final glim = _glim(context);
    return DecoratedBox(
      decoration: GlimDecoration(color: glim.stoneSurface2, shape: glimOutline(glim.shape, glim.shape.nested)),
      child: Padding(padding: padding, child: child),
    );
  }
}

/// The stone, the light engine's hidden level: a fine grain over [child].
/// Put it round the page, under nothing that takes the pointer.
class GlimGrain extends StatelessWidget {
  const GlimGrain({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) => CustomPaint(
        foregroundPainter: GlimEngines.of(context).light == GlimLight.stone ? const _GrainPainter() : null,
        child: child,
      );
}

class _GrainPainter extends CustomPainter {
  const _GrainPainter();

  static const _side = 160;
  static ui.Image? _tile;

  // One tile of grey specks, made once and repeated over the page.
  static ui.Image get tile => _tile ??= () {
        final random = math.Random(53);
        final recorder = ui.PictureRecorder();
        final canvas = Canvas(recorder);
        final speck = Paint();
        for (var y = 0; y < _side; y++) {
          for (var x = 0; x < _side; x++) {
            final grey = 90 + random.nextInt(76);
            speck.color = Color.fromARGB(random.nextInt(256), grey, grey, grey);
            canvas.drawRect(Rect.fromLTWH(x.toDouble(), y.toDouble(), 1, 1), speck);
          }
        }
        return recorder.endRecording().toImageSync(_side, _side);
      }();

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(
      Offset.zero & size,
      Paint()
        ..shader = ImageShader(tile, TileMode.repeated, TileMode.repeated, Matrix4.identity().storage)
        ..color = const Color.fromRGBO(0, 0, 0, 0.07)
        ..blendMode = BlendMode.overlay,
    );
  }

  @override
  bool shouldRepaint(_GrainPainter oldDelegate) => false;
}
