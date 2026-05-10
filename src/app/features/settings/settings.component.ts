import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonToggle,
} from '@ionic/angular/standalone';
import { SettingsStore } from '../../core/state/settings.store';
import { LibraryBridgeService } from '../../core/bridge/library-bridge.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonToggle,
  ],
  templateUrl: './settings.component.html',
  styleUrl:    './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  protected readonly settings      = inject(SettingsStore);
  private  readonly libraryBridge  = inject(LibraryBridgeService);

  async scanLibrary(): Promise<void> {
    const granted = await this.libraryBridge.requestPermissions();
    if (granted) await this.libraryBridge.startScan(false);
  }

  onGaplessChange(event: CustomEvent): void {
    this.settings.patch({ gaplessPlayback: event.detail.checked });
  }

  onDynamicColorChange(event: CustomEvent): void {
    this.settings.patch({ dynamicColor: event.detail.checked });
  }

  onSyncWifiChange(event: CustomEvent): void {
    this.settings.patch({ syncOnWifiOnly: event.detail.checked });
  }
}
