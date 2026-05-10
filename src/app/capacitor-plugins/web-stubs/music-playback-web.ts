import { WebPlugin } from '@capacitor/core';
import type { MusicPlaybackPluginDefinition } from '../music-playback-plugin';

/**
 * Web stub — used in browser/dev environment.
 * Logs calls instead of real playback. Swap for real Howler/Web Audio in future if needed.
 */
export class MusicPlaybackWeb extends WebPlugin implements MusicPlaybackPluginDefinition {
  async play(): Promise<void>              { console.debug('[MusicPlaybackWeb] play'); }
  async pause(): Promise<void>             { console.debug('[MusicPlaybackWeb] pause'); }
  async togglePlayPause(): Promise<void>   { console.debug('[MusicPlaybackWeb] togglePlayPause'); }
  async next(): Promise<void>              { console.debug('[MusicPlaybackWeb] next'); }
  async previous(): Promise<void>          { console.debug('[MusicPlaybackWeb] previous'); }
  async seekTo(): Promise<void>            { console.debug('[MusicPlaybackWeb] seekTo'); }
  async setVolume(): Promise<void>         { console.debug('[MusicPlaybackWeb] setVolume'); }
  async setSpeed(): Promise<void>          { console.debug('[MusicPlaybackWeb] setSpeed'); }
  async setShuffle(): Promise<void>        { console.debug('[MusicPlaybackWeb] setShuffle'); }
  async setRepeat(): Promise<void>         { console.debug('[MusicPlaybackWeb] setRepeat'); }
  async playQueueAt(): Promise<void>       { console.debug('[MusicPlaybackWeb] playQueueAt'); }
  async addToQueue(): Promise<void>        { console.debug('[MusicPlaybackWeb] addToQueue'); }
  async clearQueue(): Promise<void>        { console.debug('[MusicPlaybackWeb] clearQueue'); }
  async getPlaybackState(): Promise<Record<string, unknown>> {
    return { state: 'idle', positionMs: 0, durationMs: 0 };
  }
}
