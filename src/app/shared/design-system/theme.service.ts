import { Injectable, signal, computed } from '@angular/core';
import { DEFAULT_PALETTE, type DynamicPalette } from './tokens/colors';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _palette = signal<DynamicPalette>(DEFAULT_PALETTE);
  private readonly _isDark  = signal<boolean>(true);

  readonly palette = this._palette.asReadonly();
  readonly isDark  = this._isDark.asReadonly();
  readonly accentColor = computed(() => this._palette().primary);

  private root = typeof document !== 'undefined' ? document.documentElement : null;

  /**
   * Apply a dynamic palette extracted from album artwork.
   * Writes CSS custom properties to :root so all components pick them up.
   */
  applyPalette(palette: DynamicPalette): void {
    this._palette.set(palette);
    if (!this.root) return;

    this.root.style.setProperty('--dynamic-primary',    palette.primary);
    this.root.style.setProperty('--dynamic-primary-dim',palette.primaryDim);
    this.root.style.setProperty('--dynamic-bg',         palette.background);
    this.root.style.setProperty('--dynamic-surface',    palette.surface);
    this.root.style.setProperty('--dynamic-on-primary', palette.onPrimary);
    this.root.style.setProperty('--dynamic-on-surface', palette.onSurface);
  }

  resetPalette(): void {
    this.applyPalette(DEFAULT_PALETTE);
  }

  setDarkMode(dark: boolean): void {
    this._isDark.set(dark);
    if (!this.root) return;
    this.root.classList.toggle('dark', dark);
    this.root.classList.toggle('light', !dark);
  }

  /**
   * Extract dominant colors from an <img> element via canvas sampling.
   * Returns a simple dark-toned palette suitable for player background.
   * Full ML-based extraction (Palette API) lives in the Kotlin plugin.
   */
  extractFromImage(img: HTMLImageElement): DynamicPalette {
    try {
      const canvas = document.createElement('canvas');
      const SIZE = 64;
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return DEFAULT_PALETTE;

      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        r += data[i]!;
        g += data[i + 1]!;
        b += data[i + 2]!;
        count++;
      }
      if (count === 0) return DEFAULT_PALETTE;

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      const darkened = `rgb(${Math.round(r * 0.25)}, ${Math.round(g * 0.25)}, ${Math.round(b * 0.25)})`;
      const vibrant  = `rgb(${r}, ${g}, ${b})`;

      return {
        primary:    vibrant,
        primaryDim: `rgba(${r}, ${g}, ${b}, 0.2)`,
        background: darkened,
        surface:    `rgba(${r}, ${g}, ${b}, 0.08)`,
        onPrimary:  this.contrastColor(r, g, b),
        onSurface:  'oklch(93% 0.01 280)',
      };
    } catch {
      return DEFAULT_PALETTE;
    }
  }

  private contrastColor(r: number, g: number, b: number): string {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#0a0a0f' : '#ffffff';
  }
}
