import {
  ChangeDetectionStrategy, Component, computed,
  inject, input, OnInit, signal,
} from '@angular/core';
import {
  IonContent, IonIcon,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  arrowBack, shuffle, playCircle,
  ellipsisHorizontal, heart, heartOutline,
} from 'ionicons/icons';
import { LibraryStore } from '../../../core/state/library.store';
import { PlayerStore } from '../../../core/state/player.store';
import { PlaybackBridgeService } from '../../../core/bridge/playback-bridge.service';
import { TrackItemComponent } from '../../../shared/components/track-item/track-item.component';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import type { Track } from '../../../core/models/track.model';
import type { Album } from '../../../core/models/album.model';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [
    IonContent, IonIcon,
    TrackItemComponent, DurationPipe,
  ],
  templateUrl: './album-detail.component.html',
  styleUrl:    './album-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumDetailComponent implements OnInit {
  readonly id = input<string>('');

  private readonly libraryStore = inject(LibraryStore);
  protected readonly playerStore  = inject(PlayerStore);
  private readonly bridge         = inject(PlaybackBridgeService);
  private readonly location       = inject(Location);

  protected readonly album   = signal<Album | null>(null);
  protected readonly tracks  = signal<Track[]>([]);
  protected readonly liked   = signal(false);

  protected readonly totalDurationMs = computed(() =>
    this.tracks().reduce((sum, t) => sum + t.durationMs, 0),
  );

  constructor() {
    addIcons({ arrowBack, shuffle, playCircle, ellipsisHorizontal, heart, heartOutline });
  }

  ngOnInit(): void {
    const id = Number(this.id());
    const album = this.libraryStore.albums().find(a => a.id === id) ?? null;
    this.album.set(album);

    const albumTracks = this.libraryStore.tracks()
      .filter(t => t.albumId === id)
      .sort((a, b) => (a.trackNum ?? 0) - (b.trackNum ?? 0));
    this.tracks.set(albumTracks);
  }

  goBack(): void { this.location.back(); }

  toggleLike(): void { this.liked.update(v => !v); }

  async playAll(): Promise<void> {
    // Phase 6: set full queue from album tracks, play from index 0
    console.log('play album', this.id());
  }

  async playShuffle(): Promise<void> {
    await this.bridge.setShuffle(true);
    await this.playAll();
  }

  async onTrackPlay(track: Track): Promise<void> {
    const idx = this.tracks().findIndex(t => t.id === track.id);
    console.log('play track at', idx);
  }
}
