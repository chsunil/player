import { registerPlugin } from '@capacitor/core';

/**
 * TypeScript interface for the native MusicPlaybackPlugin.
 * Implemented in: android/app/src/main/java/com/gmc/musicplayer/plugins/MusicPlaybackPlugin.kt
 */
export interface MusicPlaybackPluginDefinition {
  play(): Promise<void>;
  pause(): Promise<void>;
  togglePlayPause(): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  seekTo(options: { positionMs: number }): Promise<void>;
  setVolume(options: { volume: number }): Promise<void>;
  setSpeed(options: { speed: number }): Promise<void>;
  setShuffle(options: { enabled: boolean }): Promise<void>;
  setRepeat(options: { mode: string }): Promise<void>;
  playQueueAt(options: { index: number }): Promise<void>;
  addToQueue(options: { trackId: number; next: boolean }): Promise<void>;
  clearQueue(): Promise<void>;
  getPlaybackState(): Promise<Record<string, unknown>>;
  addListener(
    event: 'playbackStateChanged' | 'trackChanged' | 'progressUpdate' | 'queueChanged' | 'playbackError',
    handler: (data: Record<string, unknown>) => void,
  ): Promise<{ remove: () => Promise<void> }>;
  removeAllListeners(): Promise<void>;
}

export const MusicPlaybackPlugin = registerPlugin<MusicPlaybackPluginDefinition>(
  'MusicPlaybackPlugin',
  {
    web: () => import('./web-stubs/music-playback-web').then(m => new m.MusicPlaybackWeb()),
  },
);
