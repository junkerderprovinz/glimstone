import 'package:flutter/material.dart';

import 'glyph.dart';
import 'theme.dart';
import 'tokens.g.dart';

/// The fills a button can take, as `ButtonTone` in the core.
enum GlimTone { accent, neutral, subtle, ok, danger, warn }

/// How much of a control is shown, as `LabelMode` in the core. Reactive shows
/// the glyph at rest and the words under the pointer or the focus.
enum GlimLabelMode { text, textGlyph, glyph, reactive }

/// The width a label needs, as `widthStage` in the core: a fullwidth
/// character counts twice, a glyph and its gap about five, and each stage is a
/// floor so a mode change never moves the row.
double glimStageWidth(String label, {bool glyph = false}) {
  var units = glyph ? 5 : 0;
  for (final rune in label.runes) {
    final fullwidth = (rune >= 0x1100 && rune <= 0x115f) ||
        (rune >= 0x2e80 && rune <= 0xa4cf) ||
        (rune >= 0xac00 && rune <= 0xd7a3) ||
        (rune >= 0xf900 && rune <= 0xfaff) ||
        (rune >= 0xfe30 && rune <= 0xfe6f) ||
        (rune >= 0xff00 && rune <= 0xff60) ||
        (rune >= 0xffe0 && rune <= 0xffe6);
    units += fullwidth ? 2 : 1;
  }
  if (units <= 10) return GlimMetrics.btnWXs;
  if (units <= 16) return GlimMetrics.btnWSm;
  if (units <= 26) return GlimMetrics.btnWMd;
  return GlimMetrics.btnWLg;
}

/// The one clickable control. The label is always the accessible name, also
/// where the mode shows only the glyph; then it is the tooltip too. A button
/// without a glyph shows its words in every mode, since a row of blank squares
/// cannot be identified.
class GlimButton extends StatefulWidget {
  const GlimButton({
    super.key,
    required this.label,
    this.glyph,
    this.onPressed,
    this.tone = GlimTone.neutral,
    this.mode = GlimLabelMode.textGlyph,
    this.busy = false,
    this.busyLabel = 'Busy',
  });

  /// The words, present in every mode. Keep them stable while the button works.
  final String label;
  final GlimGlyphData? glyph;

  /// Null disables the button.
  final VoidCallback? onPressed;
  final GlimTone tone;
  final GlimLabelMode mode;

  /// Shows a spinner in place of the glyph; the width stays.
  final bool busy;

  /// What a screen reader hears while the button is busy.
  final String busyLabel;

  @override
  State<GlimButton> createState() => _GlimButtonState();
}

class _GlimButtonState extends State<GlimButton> {
  bool _hover = false;
  bool _focus = false;

  @override
  Widget build(BuildContext context) {
    final glim = Theme.of(context).extension<GlimTheme>() ?? GlimTheme.dark;
    final enabled = widget.onPressed != null;
    final hasGlyph = widget.glyph != null || widget.busy;
    final hides = widget.mode == GlimLabelMode.glyph ||
        (widget.mode == GlimLabelMode.reactive && !_hover && !_focus);
    final showText = !hasGlyph || !hides;
    final showGlyph = hasGlyph && widget.mode != GlimLabelMode.text;
    final (ground, ink) = _fill(glim);

    final face = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (showGlyph)
          widget.busy
              ? SizedBox.square(
                  dimension: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: ink))
              : GlimGlyph(widget.glyph!,
                  size: 14, color: _tinted ? glim.accentInk : ink),
        if (showGlyph && showText) const SizedBox(width: GlimMetrics.btnGap),
        if (showText)
          Flexible(
            child: Text(
              widget.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                  color: ink,
                  fontSize: GlimMetrics.textBody,
                  fontWeight: FontWeight.w500,
                  // A variable font such as Noto Sans takes its weight here.
                  fontVariations: const [FontVariation.weight(500)],
                  height: 1.4),
            ),
          ),
      ],
    );

    final button = Semantics(
      button: true,
      enabled: enabled,
      label: widget.label,
      value: widget.busy ? widget.busyLabel : null,
      child: ExcludeSemantics(
        child: FocusableActionDetector(
          enabled: enabled,
          mouseCursor:
              enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
          onShowFocusHighlight: (on) => setState(() => _focus = on),
          actions: {
            ActivateIntent: CallbackAction<ActivateIntent>(
                onInvoke: (_) => widget.onPressed?.call())
          },
          // Hover from a MouseRegion rather than the detector's highlight, which
          // waits for a mouse move to switch the highlight mode first.
          child: MouseRegion(
            onEnter: (_) => setState(() => _hover = enabled),
            onExit: (_) => setState(() => _hover = false),
            child: GestureDetector(
              onTap: widget.onPressed,
              child: Opacity(
                opacity: enabled ? 1 : 0.5,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 120),
                  height: GlimMetrics.btnH,
                  // The words take a width stage as a floor; the modes that
                  // hide them hug the glyph.
                  constraints: hides && hasGlyph
                      ? null
                      : BoxConstraints(minWidth: glimStageWidth(widget.label, glyph: hasGlyph)),
                  padding: const EdgeInsets.symmetric(
                      horizontal: GlimMetrics.btnPadX),
                  decoration: BoxDecoration(
                    color: ground,
                    borderRadius: BorderRadius.circular(glim.shape.pill),
                    border: _focus
                        ? Border.all(color: glim.accent, width: 2)
                        : null,
                  ),
                  child: face,
                ),
              ),
            ),
          ),
        ),
      ),
    );
    return hides && hasGlyph
        ? Tooltip(message: widget.label, child: button)
        : button;
  }

  // The surface tones take rule 40's tint under the pointer: a little of the
  // accent in the ground and all of it in the glyph.
  bool get _tinted =>
      (_hover || _focus) &&
      (widget.tone == GlimTone.neutral || widget.tone == GlimTone.subtle);

  (Color, Color) _fill(GlimTheme g) {
    final lit = _hover || _focus;
    return switch (widget.tone) {
      GlimTone.accent => (lit ? g.accentHover : g.accent, g.accentContrast),
      GlimTone.neutral => (
          lit
              ? Color.lerp(g.carbonHoverRaised, g.accentInk, 0.22)!
              : g.carbonSurface3,
          g.carbonText
        ),
      GlimTone.subtle => (
          lit
              ? Color.lerp(g.carbonSurface3, g.accentInk, 0.22)!
              : g.carbonSurface2,
          g.carbonText
        ),
      GlimTone.ok => (lit ? g.statusOkHover : g.statusOkSolid, g.carbonBg),
      GlimTone.danger => (
          lit ? g.statusFailHover : g.statusFailSolid,
          g.carbonBg
        ),
      GlimTone.warn => (
          lit ? g.statusWarnHover : g.statusWarnSolid,
          g.carbonBg
        ),
    };
  }
}
