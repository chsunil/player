import { Injectable, signal, computed } from '@angular/core';

export type ThemeMode = 'dark' | 'light' | 'system';
export type GridColumns = 2 | 3 | 4;
export type AudioQuality = 'low' | 'medium' | 'high' | 'lossless';

export interface AppSettings {
  readonly themeMode: ThemeMode;
  readonly dynamicColor: boolean;
  readonly albumGridColumns: GridColumns;
  readonly crossfadeDurationMs: number;
  readonly gaplessPlayback: boolean;
  readonly replayGain: boolean;
  readonly audioQuality: AudioQuality;
  readonly cacheMaxSizeMb: number;
  readonly syncOnWifiOnly: boolean;
  readonly showAlbumArtInNotification: boolean;
  readonly sleepTimerMinutes: number | null;
  readonly equalizerEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  themeMode:                   'dark',
  dynamicColor:                true,
  albumGridColumns:            2,
  crossfadeDurationMs:         0,
  gaplessPlayback:             true,
  replayGain:                  false,
  audioQuality:                'high',
  cacheMaxSizeMb:              1024,
  syncOnWifiOnly:              true,
  showAlbumArtInNotification:  true,
  sleepTimerMinutes:           null,
  equalizerEnabled:            false,
};

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly _settings = signal<AppSettings>(DEFAULT_SETTINGS);

  readonly settings = this._settings.asReadonly();

  readonly themeMode           = computed(() => this._settings().themeMode);
  readonly dynamicColor        = computed(() => this._settings().dynamicColor);
  readonly albumGridColumns    = computed(() => this._settings().albumGridColumns);
  readonly gaplessPlayback     = computed(() => this._settings().gaplessPlayback);
  readonly crossfadeDurationMs = computed(() => this._settings().crossfadeDurationMs);
  readonly isCrossfadeEnabled  = computed(() => this._settings().crossfadeDurationMs > 0);
  readonly sleepTimerMinutes   = computed(() => this._settings().sleepTimerMinutes);
  readonly syncOnWifiOnly      = computed(() => this._settings().syncOnWifiOnly);

  patch(partial: Partial<AppSettings>): void {
    this._settings.update(s => ({ ...s, ...partial }));
  }

  hydrate(raw: Partial<AppSettings>): void {
    this._settings.update(s => ({ ...s, ...raw }));
  }

  reset(): void {
    this._settings.set(DEFAULT_SETTINGS);
  }
}
