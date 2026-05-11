import {
  ChangeDetectionStrategy, Component, computed,
  inject, OnInit, signal,
} from '@angular/core';
import { LibraryStore } from '../../core/state/library.store';
import { PlayerStore } from '../../core/state/player.store';
import { LibraryBridgeService } from '../../core/bridge/library-bridge.service';
import { AlbumCardComponent } from '../../shared/components/album-card/album-card.component';
import { ShortcutCardComponent, type Shortcut } from '../../shared/components/shortcut-card/shortcut-card.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import type { Album } from '../../core/models/album.model';

type FilterChip = 'all' | 'music' | 'albums' | 'artists';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AlbumCardComponent, ShortcutCardComponent, SectionHeaderComponent],
  templateUrl: './home.component.html',
  styleUrl:    './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  protected readonly libraryStore = inject(LibraryStore);
  protected readonly playerStore  = inject(PlayerStore);
  private  readonly libraryBridge = inject(LibraryBridgeService);

  protected readonly activeFilter = signal<FilterChip>('all');

  protected readonly greeting = computed<string>(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  });

  protected readonly shortcuts = computed<Shortcut[]>(() =>
    this.libraryStore.albums().slice(0, 6).map(a => ({
      id: String(a.id), title: a.title, artworkUri: a.artworkUri, subtitle: a.artist,
    })),
  );

  protected readonly recentAlbums = computed<Album[]>(() =>
    this.libraryStore.albums().slice(0, 10),
  );

  protected readonly topAlbums = computed<Album[]>(() =>
    this.libraryStore.albums().slice(0, 10).reverse(),
  );

  async ngOnInit(): Promise<void> {
    if (this.libraryStore.isEmpty() && !this.libraryStore.isScanning()) {
      const granted = await this.libraryBridge.checkPermissions();
      if (granted) await this.libraryBridge.startScan(true);
    }
  }

  setFilter(f: FilterChip): void { this.activeFilter.set(f); }

  async onAlbumPlay(album: Album): Promise<void> {
    console.log('play album', album.id);
  }
}
