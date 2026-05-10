/** Animation constants for use in Angular animations or inline styles. */

export const Duration = {
  instant:  80,
  fast:     150,
  normal:   250,
  slow:     380,
  slower:   550,
} as const;

export const Easing = {
  spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  out:     'cubic-bezier(0.0, 0.0, 0.2, 1)',
  inOut:   'cubic-bezier(0.4, 0, 0.2, 1)',
  decel:   'cubic-bezier(0.0, 0.0, 0.3, 1)',
  linear:  'linear',
} as const;

export const SpringConfig = {
  /** Android-style spring for list items */
  listItem: { stiffness: 380, damping: 28 },
  /** Player expansion spring */
  player:   { stiffness: 300, damping: 30 },
  /** Artwork scale on play */
  artwork:  { stiffness: 420, damping: 22 },
} as const;
