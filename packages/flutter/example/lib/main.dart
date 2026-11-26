import 'package:flutter/material.dart';
import 'package:glimstone/glimstone.dart';

// The Flutter column of the site's demos. The site loads this app in a frame
// and passes the demo, the theme, the accent, the shape, the light, the
// glyphs, the motion and the label mode in the address, such as
// `?demo=CardBasic&theme=light&accent=%231D99F3&light=glow`.
void main() {
  final query = Uri.base.queryParameters;
  T pick<T extends Enum>(List<T> values, String key, T fallback) =>
      values.firstWhere((v) => v.name == query[key], orElse: () => fallback);
  runApp(DemoApp(
    demo: query['demo'] ?? 'ButtonTones',
    brightness: query['theme'] == 'light' ? Brightness.light : Brightness.dark,
    accent: accentFrom(query['accent']),
    shape: pick(GlimShape.values, 'shape', GlimShape.soft),
    light: pick(GlimLight.values, 'light', glimDefaultLight),
    glyphs: pick(GlimGlyphStyle.values, 'glyphs', glimDefaultGlyphs),
    motion: pick(GlimMotion.values, 'motion', glimDefaultMotion),
    mode: pick(GlimLabelMode.values, 'labels', GlimLabelMode.textGlyph),
  ));
}

/// A colour written as `#RRGGBB` or `RRGGBB`, or null for anything else, which
/// leaves the default accent.
Color? accentFrom(String? value) {
  final hex = RegExp(r'^#?([0-9a-fA-F]{6})$').firstMatch(value ?? '')?.group(1);
  return hex == null ? null : Color(0xFF000000 | int.parse(hex, radix: 16));
}

class DemoApp extends StatelessWidget {
  const DemoApp({
    super.key,
    required this.demo,
    required this.brightness,
    required this.accent,
    required this.shape,
    required this.light,
    required this.glyphs,
    required this.motion,
    required this.mode,
  });

  final String demo;
  final Brightness brightness;
  final Color? accent;
  final GlimShape shape;
  final GlimLight light;
  final GlimGlyphStyle glyphs;
  final GlimMotion motion;
  final GlimLabelMode mode;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: _theme(glimThemeData(brightness, shape: shape, accent: accent, light: light, glyphs: glyphs, motion: motion)),
      home: Scaffold(
        body: GlimGrain(
          child: Center(
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.center,
              children: switch (demo) {
                'ButtonStates' => [ButtonStates(mode: mode)],
                'ToggleBasic' => const [ToggleBasic()],
                'CardBasic' => [CardBasic(mode: mode)],
                _ => _tones(mode),
              },
            ),
          ),
        ),
      ),
    );
  }
}

List<Widget> _tones(GlimLabelMode mode) => [
      GlimButton(label: 'Save', glyph: GlimGlyphs.save, tone: GlimTone.accent, mode: mode, onPressed: () {}),
      GlimButton(label: 'Refresh', glyph: GlimGlyphs.retry, mode: mode, onPressed: () {}),
      GlimButton(label: 'Copy', glyph: GlimGlyphs.copy, tone: GlimTone.subtle, mode: mode, onPressed: () {}),
      GlimButton(label: 'Restore', glyph: GlimGlyphs.restore, tone: GlimTone.ok, mode: mode, onPressed: () {}),
      GlimButton(label: 'Delete', glyph: GlimGlyphs.trash, tone: GlimTone.danger, mode: mode, onPressed: () {}),
      GlimButton(label: 'Upload', glyph: GlimGlyphs.upload, tone: GlimTone.warn, mode: mode, onPressed: () {}),
    ];

class ButtonStates extends StatefulWidget {
  const ButtonStates({super.key, required this.mode});

  final GlimLabelMode mode;

  @override
  State<ButtonStates> createState() => _ButtonStatesState();
}

class _ButtonStatesState extends State<ButtonStates> {
  bool _busy = false;

  void _run() {
    setState(() => _busy = true);
    Future.delayed(const Duration(milliseconds: 1800), () {
      if (mounted) setState(() => _busy = false);
    });
  }

  @override
  Widget build(BuildContext context) => Wrap(
        spacing: 12,
        children: [
          GlimButton(
            label: 'Back up now',
            glyph: GlimGlyphs.backupNow,
            tone: GlimTone.accent,
            mode: widget.mode,
            busy: _busy,
            onPressed: _run,
          ),
          GlimButton(label: 'Download', glyph: GlimGlyphs.download, mode: widget.mode),
        ],
      );
}

class ToggleBasic extends StatefulWidget {
  const ToggleBasic({super.key});

  @override
  State<ToggleBasic> createState() => _ToggleBasicState();
}

class _ToggleBasicState extends State<ToggleBasic> {
  bool _quiet = true;
  bool _sound = false;

  @override
  Widget build(BuildContext context) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 16,
        children: [
          GlimSwitch(label: 'Quiet notifications', value: _quiet, onChanged: (v) => setState(() => _quiet = v)),
          GlimSwitch(label: 'Play a sound', value: _sound, onChanged: _quiet ? (v) => setState(() => _sound = v) : null),
        ],
      );
}

class CardBasic extends StatefulWidget {
  const CardBasic({super.key, required this.mode});

  final GlimLabelMode mode;

  @override
  State<CardBasic> createState() => _CardBasicState();
}

class _CardBasicState extends State<CardBasic> {
  bool _nightly = true;

  @override
  Widget build(BuildContext context) => ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: GlimCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 16,
            children: [
              GlimSwitch(label: 'Run every night', value: _nightly, onChanged: (v) => setState(() => _nightly = v)),
              Align(
                alignment: AlignmentDirectional.centerEnd,
                child: GlimButton(label: 'Save', glyph: GlimGlyphs.save, tone: GlimTone.accent, mode: widget.mode, onPressed: () {}),
              ),
            ],
          ),
        ),
      );
}

// Transparent, so the site's stage shows through as behind the other columns.
ThemeData _theme(ThemeData base) => base.copyWith(scaffoldBackgroundColor: Colors.transparent);
