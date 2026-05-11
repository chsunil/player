import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LibraryStore } from '../../core/state/library.store';
import type { Track } from '../../core/models/track.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrl:    './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private readonly libraryStore = inject(LibraryStore);
  protected readonly query      = signal('');

  protected readonly results = computed<readonly Track[]>(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    return this.libraryStore.tracks().filter(
      t => t.title.toLowerCase().includes(q) ||
           t.artist.toLowerCase().includes(q) ||
           t.album.toLowerCase().includes(q),
    ).slice(0, 50);
  });

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
