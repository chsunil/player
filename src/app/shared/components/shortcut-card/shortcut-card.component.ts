import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Output,
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { musicalNotes } from 'ionicons/icons';

export interface Shortcut {
  readonly id: string;
  readonly title: string;
  readonly artworkUri: string | null;
  readonly subtitle?: string;
}

@Component({
  selector: 'app-shortcut-card',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './shortcut-card.component.html',
  styleUrl:    './shortcut-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortcutCardComponent {
  readonly item = input.required<Shortcut>();
  @Output() readonly select = new EventEmitter<Shortcut>();

  constructor() { addIcons({ musicalNotes }); }

  onSelect(): void { this.select.emit(this.item()); }
}
