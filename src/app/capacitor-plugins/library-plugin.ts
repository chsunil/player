import { registerPlugin } from '@capacitor/core';

export interface LibraryPluginDefinition {
  requestPermissions(): Promise<{ granted: boolean }>;
  checkPermissions(): Promise<{ granted: boolean }>;
  startScan(options: { incremental: boolean }): Promise<void>;
  stopScan(): Promise<void>;
  getTracks(options: { offset: number; limit: number }): Promise<{ tracks: unknown[] }>;
  getAlbums(): Promise<{ albums: unknown[] }>;
  getArtists(): Promise<{ artists: unknown[] }>;
  getArtwork(options: { trackId: number }): Promise<{ dataUri: string | null }>;
  addListener(
    event: 'scanProgress' | 'scanComplete' | 'scanError',
    handler: (data: Record<string, unknown>) => void,
  ): Promise<{ remove: () => Promise<void> }>;
  removeAllListeners(): Promise<void>;
}

export const LibraryPlugin = registerPlugin<LibraryPluginDefinition>(
  'LibraryPlugin',
  {
    web: () => import('./web-stubs/library-web').then(m => new m.LibraryWeb()),
  },
);
