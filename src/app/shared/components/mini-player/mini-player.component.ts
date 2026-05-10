import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  play, pause, playSkipForward,
  musicalNotes, heartOutline,
} from 'ionicons/icons';
import { PlayerStore } from '../../../core/state/player.store';
import { PlaybackBridgeService } from '../../../core/bridge/playback-bridge.service';

@Component({
  selector: 'app-mini-player',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './mini-player.component.html',
  styleUrl:    './mini-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniPlayerComponent {
  @Output() readonly expand = new EventEmitter<void>();

  protected readonly store  = inject(PlayerStore);
  private  readonly bridge  = inject(PlaybackBridgeService);

  constructor() {
    addIcons({ play, pause, playSkipForward, musicalNotes, heartOutline });
  }

  onExpand(event: Event): void {
    event.stopPropagation();
    this.expand.emit();
  }

  async togglePlay(event: Event): Promise<void> {
    event.stopPropagation();
    await this.bridge.togglePlayPause();
  }

  async skipNext(event: Event): Promise<void> {
    event.stopPropagation();
    await this.bridge.next();
  }
}
