import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Output,
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisVertical, musicalNotes } from 'ionicons/icons';
import type { Track } from '../../../core/models/track.model';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-track-item',
  standalone: true,
  imports: [IonIcon, DurationPipe],
  templateUrl: './track-item.component.html',
  styleUrl:    './track-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackItemComponent {
  readonly track   = input.required<Track>();
  readonly index   = input<number | null>(null);
  readonly active  = input<boolean>(false);
  readonly showNum = input<boolean>(false);

  @Output() readonly play    = new EventEmitter<Track>();
  @Output() readonly options = new EventEmitter<Track>();

  constructor() {
    addIcons({ ellipsisVertical, musicalNotes });
  }

  onTap(): void {
    this.play.emit(this.track());
  }

  onOptions(event: Event): void {
    event.stopPropagation();
    this.options.emit(this.track());
  }
}
