import {
  ChangeDetectionStrategy, Component, inject, signal, computed,
} from '@angular/core';
import {
  IonHeader, IonToolbar, IonContent, IonSearchbar,
} from '@ionic/angular/standalone';
import { LibraryStore } from '../../core/state/library.store';
import type { Track } from '../../core/models/track.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonSearchbar],
  templateUrl: './search.component.html',
  styleUrl:    './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  protected readonly libraryStore = inject(LibraryStore);
  protected readonly query        = signal('');

  protected readonly results = computed<readonly Track[]>(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    return this.libraryStore.tracks().filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q),
    ).slice(0, 50);
  });

  onSearch(event: CustomEvent): void {
    this.query.set(String(event.detail.value ?? ''));
  }
}
