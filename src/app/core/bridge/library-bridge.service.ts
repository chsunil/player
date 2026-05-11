import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LibraryStore } from '../state/library.store';
import type { Track } from '../models/track.model';
import type { Album } from '../models/album.model';
import type { Artist } from '../models/artist.model';

@Injectable({ providedIn: 'root' })
export class LibraryBridgeService implements OnDestroy {
  private plugin: Record<string, (...args: unknown[]) => Promise<unknown>> | null = null;
  private readonly listeners: Array<{ remove: () => Promise<void> }> = [];
  /** Cached init promise — prevents double-init and lets callers await it. */
  private initPromise: Promise<void> | null = null;

  constructor(
    private readonly libraryStore: LibraryStore,
    private readonly zone: NgZone,
  ) {}

  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
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
              const msg = String(data['message'] ?? 'Scan failed');
              console.error('[LibraryBridge] scan error:', msg);
              this.libraryStore.setScanStatus('error', msg);
            }),
        ),
      );
    } catch (err) {
      console.warn('[LibraryBridge] Native plugin not available:', err);
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
    this.zone.run(() => this.libraryStore.setScanStatus('scanning'));
    await this.call('startScan', { incremental });
  }

  async stopScan(): Promise<void> {
    await this.call('stopScan');
    this.zone.run(() => this.libraryStore.setScanStatus('idle'));
  }

  async getTracks(offset = 0, limit = 2000): Promise<readonly Track[]> {
    const result = await this.call('getTracks', { offset, limit });
    const raw = ((result as Record<string, unknown>)?.['tracks'] as unknown[]) ?? [];
    return raw as Track[];
  }

  async getAlbums(): Promise<readonly Album[]> {
    const result = await this.call('getAlbums');
    const raw = ((result as Record<string, unknown>)?.['albums'] as unknown[]) ?? [];
    return raw as Album[];
  }

  async getArtists(): Promise<readonly Artist[]> {
    const result = await this.call('getArtists');
    const raw = ((result as Record<string, unknown>)?.['artists'] as unknown[]) ?? [];
    return raw as Artist[];
  }

  /** Load all library data from MediaStore into Angular signals. */
  async loadAllIntoStore(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      this.libraryStore.setLoading(true);

      const [tracks, albums, artists] = await Promise.all([
        this.getTracks(),
        this.getAlbums(),
        this.getArtists(),
      ]);

      this.zone.run(() => {
        this.libraryStore.setTracks(tracks);
        this.libraryStore.setAlbums(albums);
        this.libraryStore.setArtists(artists);
        this.libraryStore.setLoading(false);
      });

      console.info(
        `[LibraryBridge] Loaded: ${tracks.length} tracks, ${albums.length} albums, ${artists.length} artists`,
      );
    } catch (err) {
      console.error('[LibraryBridge] loadAllIntoStore failed:', err);
      this.zone.run(() => this.libraryStore.setLoading(false));
    }
  }

  /** Request permissions → scan → load all into store. Single call for full refresh. */
  async scanAndLoad(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      console.warn('[LibraryBridge] Permission denied');
      return;
    }

    // Show scanning state immediately so animation appears before data loads
    this.zone.run(() => this.libraryStore.setScanStatus('scanning'));

    // Load whatever is already indexed (fast path)
    await this.loadAllIntoStore();

    // Then trigger a fresh scan (events will reload store when done)
    await this.call('startScan', { incremental: true });
  }

  private onScanComplete(data: Record<string, unknown>): void {
    this.libraryStore.setScanStatus('done');
    this.libraryStore.setLastSyncAt(Date.now());
    console.info(`[LibraryBridge] Scan complete. Tracks: ${data['trackCount'] ?? 0}`);
    void this.loadAllIntoStore();
  }

  private async call(
    method: string,
    args: Record<string, unknown> = {},
  ): Promise<unknown> {
    // Ensure init completed before every call — guards against the race where
    // child components invoke the bridge before app.ts ngOnInit awaits initialize().
    if (!this.plugin) await this.initialize();
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
