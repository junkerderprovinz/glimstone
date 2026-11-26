import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'engines.dart';
import 'engines.g.dart';
import 'paint.dart';
import 'theme.dart';
import 'tokens.g.dart';

/// The switch, as `Toggle` in the core, and never a checkbox (rule 23). The knob
/// keeps 3px of track above, below and at the end it rests on, off, on and
/// while pressed, when it stretches toward the other end. It is white on the
/// light ramp and dark stone on the dark ones, the same in both states.
class GlimSwitch extends StatefulWidget {
  const GlimSwitch({super.key, required this.label, required this.value, this.onChanged, this.hideLabel = false});

  /// The accessible name, also where [hideLabel] keeps it off the screen.
  final String label;
  final bool value;

  /// Null disables the switch.
  final ValueChanged<bool>? onChanged;
  final bool hideLabel;

  @visibleForTesting
  static const trackKey = ValueKey('glim-switch-track');
  @visibleForTesting
  static const knobKey = ValueKey('glim-switch-knob');

  @override
  State<GlimSwitch> createState() => _GlimSwitchState();
}

// The track and the knob of `.glim-toggle-track` in tokens.css.
const _trackWidth = 36.0;
const _trackHeight = 20.0;
const _knob = 14.0;
const _knobPressed = 18.0;
const _inset = (_trackHeight - _knob) / 2;

class _GlimSwitchState extends State<GlimSwitch> {
  bool _focus = false;
  bool _pressed = false;

  bool get _enabled => widget.onChanged != null;

  void _flip() => widget.onChanged?.call(!widget.value);

  @override
  Widget build(BuildContext context) {
    final glim = Theme.of(context).extension<GlimTheme>() ?? GlimTheme.dark;
    final lighting = GlimEngines.lightingOf(context);
    final motion = GlimEngines.motionOf(context);
    final on = widget.value;
    final width = _pressed && _enabled ? _knobPressed : _knob;
    // At round the knob stays a circle inside the stadium.
    final knobShape = glimOutline(glim.shape, math.min(glim.shape.pill, _knob / 2));

    final track = SizedBox(
      key: GlimSwitch.trackKey,
      width: _trackWidth,
      height: _trackHeight,
      child: Stack(
        children: [
          Positioned.fill(
            child: AnimatedContainer(
              duration: motion.controlDur,
              curve: motion.ease,
              decoration: GlimDecoration(
                color: on ? glim.accent : glim.toggleOff,
                gradient: on ? lighting.sheenOn : null,
                shape: glimOutline(glim.shape, glim.shape.pill),
              ),
            ),
          ),
          AnimatedPositionedDirectional(
            key: GlimSwitch.knobKey,
            duration: motion.shapeDur,
            curve: motion.spring,
            start: on ? _trackWidth - width - _inset : _inset,
            top: _inset,
            width: width,
            height: _knob,
            child: AnimatedContainer(
              duration: motion.controlDur,
              curve: motion.ease,
              // On the accent the knob takes the accent's ink, which holds 3:1 where white or stone would not.
              decoration: GlimDecoration(color: on ? glim.accentContrast : glim.toggleKnob, shape: knobShape, shadows: glim.toggleKnobShadow),
            ),
          ),
        ],
      ),
    );

    return Semantics(
      container: true,
      toggled: on,
      enabled: _enabled,
      label: widget.label,
      onTap: _enabled ? _flip : null,
      child: ExcludeSemantics(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!widget.hideLabel) ...[
              Text(widget.label, style: TextStyle(color: glim.carbonText, fontSize: GlimMetrics.textBody, height: 20 / 14)),
              const SizedBox(width: 8),
            ],
            FocusableActionDetector(
              enabled: _enabled,
              mouseCursor: _enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
              onShowFocusHighlight: (v) => setState(() => _focus = v),
              actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => _flip())},
              child: GestureDetector(
                onTap: _enabled ? _flip : null,
                onTapDown: _enabled ? (_) => setState(() => _pressed = true) : null,
                onTapUp: (_) => setState(() => _pressed = false),
                onTapCancel: () => setState(() => _pressed = false),
                child: GlimFocusRing(
                  visible: _focus,
                  shape: glim.shape,
                  radius: glim.shape.pill,
                  color: glim.focusRing,
                  width: glimFocusRingWidth,
                  child: Opacity(opacity: _enabled ? 1 : 0.5, child: track),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
