import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IonModal } from '@ionic/angular/standalone';
import { PlayerStore } from '../../core/state/player.store';
import { MiniPlayerComponent } from '../../shared/components/mini-player/mini-player.component';
import { FullPlayerComponent } from '../player/full-player/full-player.component';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    IonModal,
    MiniPlayerComponent, FullPlayerComponent,
  ],
  templateUrl: './tabs.component.html',
  styleUrl:    './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  protected readonly playerStore = inject(PlayerStore);

  openPlayer(): void  { this.playerStore.openFullPlayer(); }
  closePlayer(): void { this.playerStore.closeFullPlayer(); }
}
