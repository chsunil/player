import { computed, Injectable, signal } from '@angular/core';
import type { Track } from '../models/track.model';
import type { Album } from '../models/album.model';
import type { Artist } from '../models/artist.model';

export type LibrarySortField = 'title' | 'artist' | 'album' | 'dateAdded' | 'lastPlayed' | 'playCount';
export type SortDirection = 'asc' | 'desc';
export type LibraryView = 'tracks' | 'albums' | 'artists' | 'folders' | 'genres';

export type ScanStatus = 'idle' | 'scanning' | 'indexing' | 'done' | 'error';

export interface ScanProgress {
  readonly found: number;
  readonly indexed: number;
  readonly total: number;
  readonly currentPath: string;
}

@Injectable({ providedIn: 'root' })
export class LibraryStore {
  private readonly _tracks       = signal<readonly Track[]>([]);
  private readonly _albums       = signal<readonly Album[]>([]);
  private readonly _artists      = signal<readonly Artist[]>([]);
  private readonly _scanStatus   = signal<ScanStatus>('idle');
  private readonly _scanProgress = signal<ScanProgress>({ found: 0, indexed: 0, total: 0, currentPath: '' });
  private readonly _sortField    = signal<LibrarySortField>('title');
  private readonly _sortDir      = signal<SortDirection>('asc');
  private readonly _activeView   = signal<LibraryView>('albums');
  private readonly _isLoading    = signal<boolean>(false);
  private readonly _lastSyncAt   = signal<number | null>(null);

  readonly tracks       = this._tracks.asReadonly();
  readonly albums       = this._albums.asReadonly();
  readonly artists      = this._artists.asReadonly();
  readonly scanStatus   = this._scanStatus.asReadonly();
  readonly scanProgress = this._scanProgress.asReadonly();
  readonly sortField    = this._sortField.asReadonly();
  readonly sortDir      = this._sortDir.asReadonly();
  readonly activeView   = this._activeView.asReadonly();
  readonly isLoading    = this._isLoading.asReadonly();
  readonly lastSyncAt   = this._lastSyncAt.asReadonly();

  readonly trackCount  = computed(() => this._tracks().length);
  readonly albumCount  = computed(() => this._albums().length);
  readonly artistCount = computed(() => this._artists().length);
  readonly isScanning  = computed(() => this._scanStatus() === 'scanning' || this._scanStatus() === 'indexing');
  readonly isEmpty     = computed(() => this._tracks().length === 0 && !this.isScanning());

  setTracks(tracks: readonly Track[]): void {
    this._tracks.set(tracks);
  }

  setAlbums(albums: readonly Album[]): void {
    this._albums.set(albums);
  }

  setArtists(artists: readonly Artist[]): void {
    this._artists.set(artists);
  }

  appendTracks(newTracks: readonly Track[]): void {
    this._tracks.update(existing => [...existing, ...newTracks]);
  }

  setScanStatus(status: ScanStatus): void {
    this._scanStatus.set(status);
  }

  setScanProgress(progress: ScanProgress): void {
    this._scanProgress.set(progress);
  }

  setSort(field: LibrarySortField, dir: SortDirection): void {
    this._sortField.set(field);
    this._sortDir.set(dir);
  }

  setActiveView(view: LibraryView): void {
    this._activeView.set(view);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setLastSyncAt(ts: number): void {
    this._lastSyncAt.set(ts);
  }

  updateTrack(id: number, changes: Partial<Track>): void {
    this._tracks.update(tracks =>
      tracks.map(t => (t.id === id ? { ...t, ...changes } : t)),
    );
  }

  applyScanProgress(data: Record<string, unknown>): void {
    this._scanProgress.set({
      found:       Number(data['found'] ?? 0),
      indexed:     Number(data['indexed'] ?? 0),
      total:       Number(data['total'] ?? 0),
      currentPath: String(data['currentPath'] ?? ''),
    });
  }
}
