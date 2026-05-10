/** Design token constants — mirror of CSS @theme values for use in TS. */

export const Colors = {
  bg:           'oklch(8% 0.018 280)',
  bgElevated:   'oklch(11% 0.018 280)',
  bgCard:       'oklch(14% 0.018 280)',
  surface:      'oklch(17% 0.018 280)',
  surfaceHigh:  'oklch(21% 0.018 280)',
  accent:       'oklch(65% 0.22 280)',
  accentSoft:   'oklch(65% 0.22 280 / 0.18)',
  text:         'oklch(93% 0.01 280)',
  textSecondary:'oklch(62% 0.015 280)',
  textMuted:    'oklch(42% 0.01 280)',
  divider:      'oklch(100% 0 0 / 0.06)',
} as const;

export type ColorToken = keyof typeof Colors;

/** Palette used for dynamic theming from album art. */
export interface DynamicPalette {
  primary:     string;
  primaryDim:  string;
  background:  string;
  surface:     string;
  onPrimary:   string;
  onSurface:   string;
}

export const DEFAULT_PALETTE: DynamicPalette = {
  primary:     Colors.accent,
  primaryDim:  Colors.accentSoft,
  background:  Colors.bg,
  surface:     Colors.surface,
  onPrimary:   '#ffffff',
  onSurface:   Colors.text,
};
