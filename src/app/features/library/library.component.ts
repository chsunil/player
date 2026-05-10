import {
  ChangeDetectionStrategy, Component, computed,
  inject, signal,
} from '@angular/core';
import {
  IonHeader, IonToolbar, IonContent,
  IonSearchbar, IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { DecimalPipe } from '@angular/common';
import { LibraryStore, type LibraryView } from '../../core/state/library.store';
import { LibraryBridgeService } from '../../core/bridge/library-bridge.service';
import { AlbumCardComponent } from '../../shared/components/album-card/album-card.component';
import { TrackItemComponent } from '../../shared/components/track-item/track-item.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import type { Track } from '../../core/models/track.model';
import type { Album } from '../../core/models/album.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonContent,
    IonSearchbar, IonRefresher, IonRefresherContent,
    DecimalPipe,
    AlbumCardComponent, TrackItemComponent,
  ],
  templateUrl: './library.component.html',
  styleUrl:    './library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent {
  protected readonly store        = inject(LibraryStore);
  private  readonly libraryBridge = inject(LibraryBridgeService);

  protected readonly activeView  = signal<LibraryView>('albums');
  protected readonly searchQuery = signal('');

  protected readonly filteredAlbums = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const albums = this.store.albums();
    return q ? albums.filter(a =>
      a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q),
    ) : albums;
  });

  protected readonly filteredTracks = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const tracks = this.store.tracks();
    return q ? tracks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q),
    ) : tracks;
  });

  protected readonly filteredArtists = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const artists = this.store.artists();
    return q ? artists.filter(a => a.name.toLowerCase().includes(q)) : artists;
  });

  readonly views: Array<{ id: LibraryView; label: string }> = [
    { id: 'albums',   label: 'Albums' },
    { id: 'artists',  label: 'Artists' },
    { id: 'tracks',   label: 'Songs' },
    { id: 'folders',  label: 'Folders' },
  ];

  setView(v: LibraryView): void { this.activeView.set(v); }

  onSearch(event: CustomEvent): void {
    this.searchQuery.set(String(event.detail.value ?? ''));
  }

  onTrackPlay(_track: Track): void {
    // Phase 6: build queue from library, play from track position
  }

  onAlbumSelect(_album: Album): void {
    // navigate to album detail
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    await this.libraryBridge.startScan(true);
    (event.target as HTMLIonRefresherElement).complete();
  }
}
