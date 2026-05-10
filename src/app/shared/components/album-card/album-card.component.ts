import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Output,
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { musicalNotes, playCircle } from 'ionicons/icons';
import type { Album } from '../../../core/models/album.model';

@Component({
  selector: 'app-album-card',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './album-card.component.html',
  styleUrl:    './album-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumCardComponent {
  readonly album = input.required<Album>();
  readonly size  = input<'sm' | 'md' | 'lg'>('md');

  @Output() readonly select = new EventEmitter<Album>();
  @Output() readonly play   = new EventEmitter<Album>();

  constructor() {
    addIcons({ musicalNotes, playCircle });
  }

  onSelect(): void  { this.select.emit(this.album()); }
  onPlay(e: Event): void {
    e.stopPropagation();
    this.play.emit(this.album());
  }
}
