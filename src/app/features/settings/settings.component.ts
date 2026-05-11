import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsStore } from '../../core/state/settings.store';
import { LibraryBridgeService } from '../../core/bridge/library-bridge.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './settings.component.html',
  styleUrl:    './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  protected readonly settings     = inject(SettingsStore);
  private  readonly libraryBridge = inject(LibraryBridgeService);

  async scanLibrary(): Promise<void> {
    const granted = await this.libraryBridge.requestPermissions();
    if (granted) await this.libraryBridge.startScan(false);
  }

  onGaplessChange(e: Event): void {
    this.settings.patch({ gaplessPlayback: (e.target as HTMLInputElement).checked });
  }

  onDynamicColorChange(e: Event): void {
    this.settings.patch({ dynamicColor: (e.target as HTMLInputElement).checked });
  }

  onSyncWifiChange(e: Event): void {
    this.settings.patch({ syncOnWifiOnly: (e.target as HTMLInputElement).checked });
  }
}
