import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import 'tokens.g.dart';

/// One layer of a CSS box-shadow: cast outside the shape, or inside it with
/// [inset], which is how the light engine draws a lit top edge.
@immutable
class GlimShadow {
  const GlimShadow(this.color, {this.offset = Offset.zero, this.blur = 0, this.spread = 0, this.inset = false});

  final Color color;
  final Offset offset;

  /// The CSS blur radius, twice the Gaussian's sigma.
  final double blur;
  final double spread;
  final bool inset;

  Paint get _paint => Paint()
    ..color = color
    ..maskFilter = blur > 0 ? MaskFilter.blur(BlurStyle.normal, blur / 2) : null;

  static GlimShadow lerp(GlimShadow a, GlimShadow b, double t) => GlimShadow(
        Color.lerp(a.color, b.color, t)!,
        offset: Offset.lerp(a.offset, b.offset, t)!,
        blur: ui.lerpDouble(a.blur, b.blur, t)!,
        spread: ui.lerpDouble(a.spread, b.spread, t)!,
        inset: t < 0.5 ? a.inset : b.inset,
      );

  /// A layer that only one side has fades in or out, as the browser
  /// interpolates two shadow lists of different lengths.
  static List<GlimShadow> lerpList(List<GlimShadow> a, List<GlimShadow> b, double t) => [
        for (var i = 0; i < math.max(a.length, b.length); i++)
          if (i >= a.length)
            lerp(b[i]._clear, b[i], t)
          else if (i >= b.length)
            lerp(a[i], a[i]._clear, t)
          else
            lerp(a[i], b[i], t),
      ];

  GlimShadow get _clear => GlimShadow(color.withValues(alpha: 0), offset: offset, blur: blur, spread: spread, inset: inset);

  @override
  bool operator ==(Object other) =>
      other is GlimShadow &&
      other.color == color &&
      other.offset == offset &&
      other.blur == blur &&
      other.spread == spread &&
      other.inset == inset;

  @override
  int get hashCode => Object.hash(color, offset, blur, spread, inset);
}

/// The outline of a surface or a control. Outside the round shape a corner is
/// a squircle, as the stylesheet draws it where the browser can. Round keeps
/// its true circles and stadiums.
OutlinedBorder glimOutline(GlimShape shape, double radius) => shape == GlimShape.round
    ? RoundedRectangleBorder(borderRadius: BorderRadius.circular(radius))
    : RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(radius));

/// A surface painted the way the stylesheet paints one: its shadows outside
/// the shape and never under it, the fill, a sheen over the fill, and the
/// inset layers inside the shape.
@immutable
class GlimDecoration extends Decoration {
  const GlimDecoration({this.color, this.gradient, this.shape = const RoundedRectangleBorder(), this.shadows = const []});

  final Color? color;

  /// Drawn over [color], as a background-image over a background-color.
  final Gradient? gradient;
  final ShapeBorder shape;
  final List<GlimShadow> shadows;

  @override
  EdgeInsetsGeometry get padding => shape.dimensions;

  @override
  bool hitTest(Size size, Offset position, {TextDirection? textDirection}) =>
      shape.getOuterPath(Offset.zero & size, textDirection: textDirection).contains(position);

  static GlimDecoration lerp(GlimDecoration a, GlimDecoration b, double t) => GlimDecoration(
        color: Color.lerp(a.color, b.color, t),
        gradient: Gradient.lerp(a.gradient, b.gradient, t),
        shape: ShapeBorder.lerp(a.shape, b.shape, t)!,
        shadows: GlimShadow.lerpList(a.shadows, b.shadows, t),
      );

  @override
  Decoration? lerpFrom(Decoration? a, double t) => a is GlimDecoration ? lerp(a, this, t) : super.lerpFrom(a, t);

  @override
  Decoration? lerpTo(Decoration? b, double t) => b is GlimDecoration ? lerp(this, b, t) : super.lerpTo(b, t);

  @override
  BoxPainter createBoxPainter([VoidCallback? onChanged]) => _GlimPainter(this);

  @override
  bool operator ==(Object other) =>
      other is GlimDecoration &&
      other.color == color &&
      other.gradient == gradient &&
      other.shape == shape &&
      listEquals(other.shadows, shadows);

  @override
  int get hashCode => Object.hash(color, gradient, shape, Object.hashAll(shadows));
}

class _GlimPainter extends BoxPainter {
  _GlimPainter(this.decoration);

  final GlimDecoration decoration;

  @override
  void paint(Canvas canvas, Offset offset, ImageConfiguration configuration) {
    final rect = offset & configuration.size!;
    final direction = configuration.textDirection;
    final shape = decoration.shape;
    final outline = shape.getOuterPath(rect, textDirection: direction);
    Rect reach(GlimShadow s) => rect.inflate(s.offset.distance + s.spread.abs() + s.blur * 2 + 1);

    final outer = decoration.shadows.where((s) => !s.inset);
    if (outer.isNotEmpty) {
      canvas.save();
      // The browser clips a shadow away under its box, which shows through a
      // translucent fill such as a tile's.
      canvas.clipPath(Path.combine(PathOperation.difference, Path()..addRect(outer.map(reach).reduce((a, b) => a.expandToInclude(b))), outline));
      for (final s in outer) {
        final cast = rect.shift(s.offset).inflate(s.spread);
        if (cast.width > 0 && cast.height > 0) canvas.drawPath(shape.getOuterPath(cast, textDirection: direction), s._paint);
      }
      canvas.restore();
    }

    if (decoration.color case final color?) canvas.drawPath(outline, Paint()..color = color);
    if (decoration.gradient case final gradient?) {
      canvas.drawPath(outline, Paint()..shader = gradient.createShader(rect, textDirection: direction));
    }

    final inner = decoration.shadows.where((s) => s.inset);
    if (inner.isNotEmpty) {
      canvas.save();
      canvas.clipPath(outline);
      for (final s in inner) {
        final hole = rect.shift(s.offset).deflate(s.spread);
        final lit = Path()..addRect(reach(s));
        canvas.drawPath(
          hole.width > 0 && hole.height > 0 ? Path.combine(PathOperation.difference, lit, shape.getOuterPath(hole, textDirection: direction)) : lit,
          s._paint,
        );
      }
      canvas.restore();
    }
  }
}

/// The focus ring: [width] of [color] standing [gap] off the control's
/// outline, as `outline-offset` draws it.
class GlimFocusRing extends StatelessWidget {
  const GlimFocusRing({
    super.key,
    required this.visible,
    required this.shape,
    required this.radius,
    required this.color,
    required this.child,
    this.width = 2,
    this.gap = 2,
  });

  final bool visible;
  final GlimShape shape;
  final double radius;
  final Color color;
  final double width;
  final double gap;
  final Widget child;

  @override
  Widget build(BuildContext context) => CustomPaint(
        foregroundPainter: visible ? _RingPainter(this, Directionality.maybeOf(context)) : null,
        child: child,
      );
}

class _RingPainter extends CustomPainter {
  _RingPainter(this.ring, this.direction);

  final GlimFocusRing ring;
  final TextDirection? direction;

  @override
  void paint(Canvas canvas, Size size) {
    final out = ring.gap + ring.width / 2;
    // An outline follows the corner out by its offset, and a square corner stays square.
    final outline = glimOutline(ring.shape, ring.radius > 0 ? ring.radius + out : 0);
    canvas.drawPath(
      outline.getOuterPath((Offset.zero & size).inflate(out), textDirection: direction),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = ring.width
        ..color = ring.color,
    );
  }

  @override
  bool shouldRepaint(_RingPainter old) =>
      old.ring.color != ring.color ||
      old.ring.shape != ring.shape ||
      old.ring.radius != ring.radius ||
      old.ring.width != ring.width ||
      old.ring.gap != ring.gap ||
      old.direction != direction;
}
