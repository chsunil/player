import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { PlayerStore, type PlaybackState } from '../state/player.store';
import { QueueStore } from '../state/queue.store';
import { queueItemFromBridge } from '../models/queue.model';

export type BridgeEventType =
  | 'playbackStateChanged'
  | 'trackChanged'
  | 'progressUpdate'
  | 'queueChanged'
  | 'playbackError';

export interface BridgeEvent {
  readonly type: BridgeEventType;
  readonly payload: Record<string, unknown>;
}

/**
 * Wraps the native MusicPlaybackPlugin Capacitor bridge.
 * On web/browser: all commands are no-ops (graceful degradation for dev).
 * On Android: delegates to native Kotlin plugin.
 *
 * IMPORTANT: never call native methods directly from components.
 * Always go through this service so the store stays the source of truth.
 */
@Injectable({ providedIn: 'root' })
export class PlaybackBridgeService implements OnDestroy {
  private readonly _events$ = new Subject<BridgeEvent>();
  readonly events$ = this._events$.asObservable();

  private plugin: Record<string, (...args: unknown[]) => Promise<unknown>> | null = null;
  private readonly listeners: Array<{ remove: () => Promise<void> }> = [];

  constructor(
    private readonly playerStore: PlayerStore,
    private readonly queueStore: QueueStore,
    private readonly zone: NgZone,
  ) {}

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Dynamic import — plugin registered in MainActivity.kt
      const mod = await import('../../capacitor-plugins/music-playback-plugin');
      this.plugin = mod.MusicPlaybackPlugin as unknown as typeof this.plugin;

      this.listeners.push(
        await (this.plugin!['addListener'] as Function)(
          'playbackStateChanged',
          (data: Record<string, unknown>) => this.zone.run(() => this.onStateChanged(data)),
        ),
        await (this.plugin!['addListener'] as Function)(
          'trackChanged',
          (data: Record<string, unknown>) => this.zone.run(() => this.onTrackChanged(data)),
        ),
        await (this.plugin!['addListener'] as Function)(
          'progressUpdate',
          (data: Record<string, unknown>) => this.zone.run(() => this.onProgress(data)),
        ),
        await (this.plugin!['addListener'] as Function)(
          'queueChanged',
          (data: Record<string, unknown>) => this.zone.run(() => this.onQueueChanged(data)),
        ),
        await (this.plugin!['addListener'] as Function)(
          'playbackError',
          (data: Record<string, unknown>) => this.zone.run(() => this.onError(data)),
        ),
      );
    } catch {
      console.warn('[PlaybackBridge] Native plugin not available');
    }
  }

  // ── Playback commands ────────────────────────────────────────────────────

  async play(): Promise<void> {
    await this.call('play');
  }

  async pause(): Promise<void> {
    await this.call('pause');
  }

  async togglePlayPause(): Promise<void> {
    await this.call('togglePlayPause');
  }

  async next(): Promise<void> {
    await this.call('next');
  }

  async previous(): Promise<void> {
    await this.call('previous');
  }

  async seekTo(positionMs: number): Promise<void> {
    await this.call('seekTo', { positionMs });
  }

  async setVolume(volume: number): Promise<void> {
    await this.call('setVolume', { volume });
  }

  async setSpeed(speed: number): Promise<void> {
    await this.call('setSpeed', { speed });
  }

  async setShuffle(enabled: boolean): Promise<void> {
    await this.call('setShuffle', { enabled });
  }

  async setRepeat(mode: string): Promise<void> {
    await this.call('setRepeat', { mode });
  }

  async playQueueAt(index: number): Promise<void> {
    await this.call('playQueueAt', { index });
  }

  async addToQueue(trackId: number, next = false): Promise<void> {
    await this.call('addToQueue', { trackId, next });
  }

  async clearQueue(): Promise<void> {
    await this.call('clearQueue');
  }

  async getPlaybackState(): Promise<Record<string, unknown> | null> {
    return (await this.call('getPlaybackState')) as Record<string, unknown> | null;
  }

  // ── Native event handlers ────────────────────────────────────────────────

  private onStateChanged(data: Record<string, unknown>): void {
    this.playerStore.setPlaybackState(data['state'] as PlaybackState);
    this._events$.next({ type: 'playbackStateChanged', payload: data });
  }

  private onTrackChanged(data: Record<string, unknown>): void {
    this.queueStore.setIndex(Number(data['queueIndex'] ?? 0));
    this._events$.next({ type: 'trackChanged', payload: data });
  }

  private onProgress(data: Record<string, unknown>): void {
    this.playerStore.setProgress(
      Number(data['positionMs'] ?? 0),
      Number(data['durationMs'] ?? 0),
      Number(data['bufferedMs'] ?? 0),
    );
    this._events$.next({ type: 'progressUpdate', payload: data });
  }

  private onQueueChanged(data: Record<string, unknown>): void {
    const rawItems = (data['items'] as Array<Record<string, unknown>>) ?? [];
    const items = rawItems.map(queueItemFromBridge);
    this.queueStore.setQueue(items, Number(data['currentIndex'] ?? 0));
    this._events$.next({ type: 'queueChanged', payload: data });
  }

  private onError(data: Record<string, unknown>): void {
    this.playerStore.setError(
      String(data['code'] ?? 'UNKNOWN'),
      String(data['message'] ?? 'Playback error'),
    );
    this._events$.next({ type: 'playbackError', payload: data });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async call(
    method: string,
    args: Record<string, unknown> = {},
  ): Promise<unknown> {
    if (!this.plugin) return null;
    try {
      return await (this.plugin[method] as Function)(args);
    } catch (err) {
      console.error(`[PlaybackBridge] ${method} failed:`, err);
      return null;
    }
  }

  ngOnDestroy(): void {
    this.listeners.forEach(l => l.remove().catch(() => void 0));
    this._events$.complete();
  }
}
