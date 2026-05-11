import {
  ChangeDetectionStrategy, Component, computed,
  inject, OnInit, signal,
} from '@angular/core';
import { LibraryStore, type LibraryView } from '../../core/state/library.store';
import { LibraryBridgeService } from '../../core/bridge/library-bridge.service';
import { AlbumCardComponent } from '../../shared/components/album-card/album-card.component';
import { TrackItemComponent } from '../../shared/components/track-item/track-item.component';
import type { Track } from '../../core/models/track.model';
import type { Album } from '../../core/models/album.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [AlbumCardComponent, TrackItemComponent],
  templateUrl: './library.component.html',
  styleUrl:    './library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent implements OnInit {
  protected readonly store        = inject(LibraryStore);
  private  readonly libraryBridge = inject(LibraryBridgeService);

  protected readonly activeView  = signal<LibraryView>('albums');
  protected readonly searchQuery = signal('');

  protected readonly filteredAlbums = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q ? this.store.albums().filter(a =>
      a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    ) : this.store.albums();
  });

  protected readonly filteredTracks = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q ? this.store.tracks().filter(t =>
      t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    ) : this.store.tracks();
  });

  protected readonly filteredArtists = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q ? this.store.artists().filter(a =>
      a.name.toLowerCase().includes(q)
    ) : this.store.artists();
  });

  readonly views: Array<{ id: LibraryView; label: string }> = [
    { id: 'albums',   label: 'Albums'  },
    { id: 'artists',  label: 'Artists' },
    { id: 'tracks',   label: 'Songs'   },
    { id: 'folders',  label: 'Folders' },
  ];

  async ngOnInit(): Promise<void> {
    if (this.store.isEmpty() && !this.store.isScanning()) {
      const granted = await this.libraryBridge.checkPermissions();
      if (granted) await this.libraryBridge.startScan(true);
    }
  }

  setView(v: LibraryView): void { this.activeView.set(v); }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onTrackPlay(_track: Track): void { /* Phase 6 */ }
  onAlbumSelect(_album: Album): void { /* navigate */ }

  async handleScan(): Promise<void> {
    const granted = await this.libraryBridge.requestPermissions();
    if (granted) await this.libraryBridge.startScan(false);
  }
}
