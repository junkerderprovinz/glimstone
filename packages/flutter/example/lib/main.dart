import 'package:flutter/material.dart';
import 'package:glimstone/glimstone.dart';

// The Flutter column of the site's demos. The site loads this app in a frame
// and passes the demo, the theme, the shape and the label mode in the address.
void main() {
  final query = Uri.base.queryParameters;
  final mode = GlimLabelMode.values.firstWhere(
    (m) => m.name == query['labels'],
    orElse: () => GlimLabelMode.textGlyph,
  );
  final shape = GlimShape.values.firstWhere(
    (s) => s.name == query['shape'],
    orElse: () => GlimShape.soft,
  );
  runApp(DemoApp(
    demo: query['demo'] ?? 'ButtonTones',
    shape: shape,
    brightness: query['theme'] == 'light' ? Brightness.light : Brightness.dark,
    mode: mode,
  ));
}

class DemoApp extends StatelessWidget {
  const DemoApp({super.key, required this.demo, required this.shape, required this.brightness, required this.mode});

  final String demo;
  final GlimShape shape;
  final Brightness brightness;
  final GlimLabelMode mode;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: _theme(glimThemeData(brightness, shape: shape)),
      home: Scaffold(
        body: Center(
          child: Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.center,
            children: switch (demo) {
              'ButtonStates' => [ButtonStates(mode: mode)],
              _ => _tones(mode),
            },
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

// Transparent, so the site's stage shows through as behind the other columns.
ThemeData _theme(ThemeData base) => base.copyWith(scaffoldBackgroundColor: Colors.transparent);
