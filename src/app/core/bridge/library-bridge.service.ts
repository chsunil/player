import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LibraryStore } from '../state/library.store';
import type { Track } from '../models/track.model';

/**
 * Wraps the native LibraryPlugin Capacitor bridge.
 * Handles MediaStore scanning, permission requests, incremental index.
 */
@Injectable({ providedIn: 'root' })
export class LibraryBridgeService implements OnDestroy {
  private plugin: Record<string, (...args: unknown[]) => Promise<unknown>> | null = null;
  private readonly listeners: Array<{ remove: () => Promise<void> }> = [];

  constructor(
    private readonly libraryStore: LibraryStore,
    private readonly zone: NgZone,
  ) {}

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const mod = await import('../../capacitor-plugins/library-plugin');
      this.plugin = mod.LibraryPlugin as unknown as typeof this.plugin;

      this.listeners.push(
        await (this.plugin!['addListener'] as Function)(
          'scanProgress',
          (data: Record<string, unknown>) =>
            this.zone.run(() => this.libraryStore.applyScanProgress(data)),
        ),
        await (this.plugin!['addListener'] as Function)(
          'scanComplete',
          (data: Record<string, unknown>) =>
            this.zone.run(() => this.onScanComplete(data)),
        ),
        await (this.plugin!['addListener'] as Function)(
          'scanError',
          (data: Record<string, unknown>) =>
            this.zone.run(() => {
              console.error('[LibraryBridge] scan error:', data['message']);
              this.libraryStore.setScanStatus('error');
            }),
        ),
      );
    } catch {
      console.warn('[LibraryBridge] Native plugin not available');
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;
    const result = await this.call('requestPermissions');
    return (result as Record<string, unknown>)?.['granted'] === true;
  }

  async checkPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    const result = await this.call('checkPermissions');
    return (result as Record<string, unknown>)?.['granted'] === true;
  }

  async startScan(incremental = true): Promise<void> {
    this.libraryStore.setScanStatus('scanning');
    await this.call('startScan', { incremental });
  }

  async stopScan(): Promise<void> {
    await this.call('stopScan');
    this.libraryStore.setScanStatus('idle');
  }

  async getTracks(offset = 0, limit = 500): Promise<readonly Track[]> {
    const result = await this.call('getTracks', { offset, limit });
    return ((result as Record<string, unknown>)?.['tracks'] as Track[]) ?? [];
  }

  async getAlbums(): Promise<unknown[]> {
    const result = await this.call('getAlbums');
    return ((result as Record<string, unknown>)?.['albums'] as unknown[]) ?? [];
  }

  async getArtists(): Promise<unknown[]> {
    const result = await this.call('getArtists');
    return ((result as Record<string, unknown>)?.['artists'] as unknown[]) ?? [];
  }

  async getArtwork(trackId: number): Promise<string | null> {
    const result = await this.call('getArtwork', { trackId });
    return ((result as Record<string, unknown>)?.['dataUri'] as string) ?? null;
  }

  private onScanComplete(data: Record<string, unknown>): void {
    this.libraryStore.setScanStatus('done');
    this.libraryStore.setLastSyncAt(Date.now());
    const count = Number(data['trackCount'] ?? 0);
    console.info(`[LibraryBridge] Scan complete. ${count} tracks indexed.`);
    // Auto-load first page of tracks into store
    void this.loadAllIntoStore();
  }

  async loadAllIntoStore(): Promise<void> {
    const tracks  = await this.getTracks(0, 2000);
    const albums  = await this.getAlbums();
    const artists = await this.getArtists();
    this.zone.run(() => {
      this.libraryStore.setTracks(tracks as never);
      this.libraryStore.setAlbums(albums as never);
      this.libraryStore.setArtists(artists as never);
    });
  }

  private async call(
    method: string,
    args: Record<string, unknown> = {},
  ): Promise<unknown> {
    if (!this.plugin) return null;
    try {
      return await (this.plugin[method] as Function)(args);
    } catch (err) {
      console.error(`[LibraryBridge] ${method} failed:`, err);
      return null;
    }
  }

  ngOnDestroy(): void {
    this.listeners.forEach(l => l.remove().catch(() => void 0));
  }
}
