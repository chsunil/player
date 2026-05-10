import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PlaybackBridgeService } from './core/bridge/playback-bridge.service';
import { LibraryBridgeService } from './core/bridge/library-bridge.service';

@Component({
  selector:        'app-root',
  standalone:      true,
  imports:         [IonApp, IonRouterOutlet],
  template:        `<ion-app><ion-router-outlet /></ion-app>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  constructor(
    private readonly playbackBridge: PlaybackBridgeService,
    private readonly libraryBridge: LibraryBridgeService,
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.playbackBridge.initialize(),
      this.libraryBridge.initialize(),
    ]);
  }
}
