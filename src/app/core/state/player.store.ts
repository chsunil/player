import { computed, Injectable, signal } from '@angular/core';
import type { Track } from '../models/track.model';
import type { RepeatMode } from '../models/queue.model';

export type PlaybackState = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused' | 'error';

export interface ProgressInfo {
  readonly positionMs: number;
  readonly durationMs: number;
  readonly bufferedMs: number;
}

export interface PlaybackError {
  readonly code: string;
  readonly message: string;
}

@Injectable({ providedIn: 'root' })
export class PlayerStore {
  private readonly _currentTrack   = signal<Track | null>(null);
  private readonly _playbackState  = signal<PlaybackState>('idle');
  private readonly _progress       = signal<ProgressInfo>({ positionMs: 0, durationMs: 0, bufferedMs: 0 });
  private readonly _shuffle        = signal<boolean>(false);
  private readonly _repeat         = signal<RepeatMode>('none');
  private readonly _volume         = signal<number>(1);
  private readonly _speed          = signal<number>(1);
  private readonly _error          = signal<PlaybackError | null>(null);
  private readonly _isFullPlayerOpen = signal<boolean>(false);

  readonly currentTrack     = this._currentTrack.asReadonly();
  readonly playbackState    = this._playbackState.asReadonly();
  readonly progress         = this._progress.asReadonly();
  readonly shuffle          = this._shuffle.asReadonly();
  readonly repeat           = this._repeat.asReadonly();
  readonly volume           = this._volume.asReadonly();
  readonly speed            = this._speed.asReadonly();
  readonly error            = this._error.asReadonly();
  readonly isFullPlayerOpen = this._isFullPlayerOpen.asReadonly();

  readonly isPlaying    = computed(() => this._playbackState() === 'playing');
  readonly isPaused     = computed(() => this._playbackState() === 'paused');
  readonly isLoading    = computed(() => {
    const s = this._playbackState();
    return s === 'loading' || s === 'buffering';
  });
  readonly isIdle       = computed(() => this._playbackState() === 'idle');
  readonly hasTrack     = computed(() => this._currentTrack() !== null);
  readonly hasError     = computed(() => this._error() !== null);

  readonly progressPercent  = computed(() => {
    const p = this._progress();
    return p.durationMs > 0 ? (p.positionMs / p.durationMs) * 100 : 0;
  });
  readonly bufferedPercent  = computed(() => {
    const p = this._progress();
    return p.durationMs > 0 ? (p.bufferedMs / p.durationMs) * 100 : 0;
  });
  readonly remainingMs      = computed(() => {
    const p = this._progress();
    return Math.max(0, p.durationMs - p.positionMs);
  });

  setCurrentTrack(track: Track | null): void {
    this._currentTrack.set(track);
    if (!track) this._playbackState.set('idle');
  }

  setPlaybackState(state: PlaybackState): void {
    this._playbackState.set(state);
    if (state !== 'error') this._error.set(null);
  }

  setProgress(positionMs: number, durationMs: number, bufferedMs = 0): void {
    this._progress.set({ positionMs, durationMs, bufferedMs });
  }

  setError(code: string, message: string): void {
    this._error.set({ code, message });
    this._playbackState.set('error');
  }

  toggleShuffle(): void {
    this._shuffle.update(s => !s);
  }

  setShuffle(value: boolean): void {
    this._shuffle.set(value);
  }

  cycleRepeat(): void {
    const order: RepeatMode[] = ['none', 'all', 'one'];
    this._repeat.update(r => order[(order.indexOf(r) + 1) % order.length]);
  }

  setRepeat(mode: RepeatMode): void {
    this._repeat.set(mode);
  }

  setVolume(vol: number): void {
    this._volume.set(Math.max(0, Math.min(1, vol)));
  }

  setSpeed(speed: number): void {
    this._speed.set(Math.max(0.25, Math.min(3, speed)));
  }

  openFullPlayer(): void {
    this._isFullPlayerOpen.set(true);
  }

  closeFullPlayer(): void {
    this._isFullPlayerOpen.set(false);
  }

  applyBridgeState(data: Record<string, unknown>): void {
    if ('state' in data) this.setPlaybackState(data['state'] as PlaybackState);
    if ('positionMs' in data && 'durationMs' in data) {
      this.setProgress(
        Number(data['positionMs']),
        Number(data['durationMs']),
        Number(data['bufferedMs'] ?? 0),
      );
    }
  }
}
