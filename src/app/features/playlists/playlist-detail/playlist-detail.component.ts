import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/library"></ion-back-button>
        </ion-buttons>
        <ion-title>Playlist</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <p style="padding:24px;color:oklch(42% 0.01 280)">Playlist ID: {{ id() }}</p>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistDetailComponent {
  readonly id = input<string>('');
}
