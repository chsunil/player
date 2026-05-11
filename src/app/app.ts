import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlaybackBridgeService } from './core/bridge/playback-bridge.service';
import { LibraryBridgeService } from './core/bridge/library-bridge.service';

@Component({
  selector:        'app-root',
  standalone:      true,
  imports:         [RouterOutlet],
  template:        `<router-outlet />`,
  styles:          [`:host { display: block; height: 100%; }`],
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
