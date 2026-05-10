import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  playCircle,
  pauseCircle,
  playSkipForward,
  playSkipBack,
  shuffleOutline,
  shuffle,
  repeatOutline,
  repeat,
  chevronDown,
  ellipsisHorizontal,
  musicalNotes,
  listOutline,
  heartOutline,
  heart,
} from 'ionicons/icons';
import { PlayerStore } from '../../../core/state/player.store';
import { QueueStore } from '../../../core/state/queue.store';
import { PlaybackBridgeService } from '../../../core/bridge/playback-bridge.service';
import { ThemeService } from '../../../shared/design-system/theme.service';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';

@Component({
  selector:        'app-full-player',
  standalone:      true,
  imports:         [IonIcon, DurationPipe],
  templateUrl:     './full-player.component.html',
  styleUrl:        './full-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullPlayerComponent implements OnInit {
  @Output() readonly dismiss = new EventEmitter<void>();
  @ViewChild('artworkImg') artworkRef?: ElementRef<HTMLImageElement>;

  protected readonly playerStore = inject(PlayerStore);
  protected readonly queueStore  = inject(QueueStore);
  private  readonly bridge       = inject(PlaybackBridgeService);
  private  readonly theme        = inject(ThemeService);

  protected isSeeking = false;
  protected seekValue = 0;

  constructor() {
    addIcons({
      playCircle, pauseCircle, playSkipForward, playSkipBack,
      shuffleOutline, shuffle, repeatOutline, repeat,
      chevronDown, ellipsisHorizontal, musicalNotes,
      listOutline, heartOutline, heart,
    });
  }

  ngOnInit(): void {
    this.applyDynamicTheme();
  }

  private applyDynamicTheme(): void {
    const img = this.artworkRef?.nativeElement;
    if (img?.complete) {
      this.theme.applyPalette(this.theme.extractFromImage(img));
    }
  }

  onArtworkLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.theme.applyPalette(this.theme.extractFromImage(img));
  }

  onDismiss(): void {
    this.theme.resetPalette();
    this.dismiss.emit();
  }

  async togglePlay(): Promise<void> {
    await this.bridge.togglePlayPause();
  }

  async next(): Promise<void> {
    await this.bridge.next();
  }

  async previous(): Promise<void> {
    await this.bridge.previous();
  }

  async toggleShuffle(): Promise<void> {
    const newVal = !this.playerStore.shuffle();
    this.playerStore.setShuffle(newVal);
    await this.bridge.setShuffle(newVal);
  }

  async cycleRepeat(): Promise<void> {
    this.playerStore.cycleRepeat();
    await this.bridge.setRepeat(this.playerStore.repeat());
  }

  onSeekStart(): void {
    this.isSeeking = true;
    this.seekValue = this.playerStore.progressPercent();
  }

  onSeekChange(value: number): void {
    this.seekValue = value;
  }

  async onSeekEnd(value: number): Promise<void> {
    this.isSeeking = false;
    const durationMs = this.playerStore.progress().durationMs;
    const positionMs = Math.round((value / 100) * durationMs);
    await this.bridge.seekTo(positionMs);
  }

  get repeatIconName(): string {
    return this.playerStore.repeat() === 'none' ? 'repeat-outline' : 'repeat';
  }

  get shuffleIconName(): string {
    return this.playerStore.shuffle() ? 'shuffle' : 'shuffle-outline';
  }

  get displayProgress(): number {
    return this.isSeeking ? this.seekValue : this.playerStore.progressPercent();
  }
}
