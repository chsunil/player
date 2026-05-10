import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudOutline, cloudDoneOutline } from 'ionicons/icons';
import { NextcloudStore } from '../../core/state/nextcloud.store';

@Component({
  selector: 'app-nextcloud',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon],
  templateUrl: './nextcloud.component.html',
  styleUrl:    './nextcloud.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextcloudComponent {
  protected readonly store = inject(NextcloudStore);

  constructor() {
    addIcons({ cloudOutline, cloudDoneOutline });
  }
}
