import { WebPlugin } from '@capacitor/core';
import type { LibraryPluginDefinition } from '../library-plugin';

export class LibraryWeb extends WebPlugin implements LibraryPluginDefinition {
  async requestPermissions(): Promise<{ granted: boolean }> { return { granted: true }; }
  async checkPermissions(): Promise<{ granted: boolean }>   { return { granted: false }; }
  async startScan(): Promise<void>  { console.debug('[LibraryWeb] startScan (no-op)'); }
  async stopScan(): Promise<void>   { console.debug('[LibraryWeb] stopScan (no-op)'); }
  async getTracks(): Promise<{ tracks: unknown[] }>  { return { tracks: [] }; }
  async getAlbums(): Promise<{ albums: unknown[] }>  { return { albums: [] }; }
  async getArtists(): Promise<{ artists: unknown[] }>{ return { artists: [] }; }
  async getArtwork(): Promise<{ dataUri: string | null }> { return { dataUri: null }; }
}
