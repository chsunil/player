import {
  ChangeDetectionStrategy, Component, computed,
  effect, inject, OnInit, signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { LibraryBridgeService } from '../../core/bridge/library-bridge.service';
import { LibraryStore } from '../../core/state/library.store';
import { DecimalPipe } from '@angular/common';

type IntroStep = 0 | 1 | 2;

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroComponent implements OnInit {
  private readonly router        = inject(Router);
  private readonly libraryBridge = inject(LibraryBridgeService);
  protected readonly store       = inject(LibraryStore);

  protected readonly step     = signal<IntroStep>(0);
  protected readonly scanning = signal(false);
  protected readonly permissionDenied = signal(false);

  protected readonly scanPct = computed(() => {
    const p = this.store.scanProgress();
    return p.total > 0 ? Math.round((p.indexed / p.total) * 100) : 0;
  });

  constructor() {
    // Advance to step 2 when scan finishes or errors
    effect(() => {
      const status = this.store.scanStatus();
      if (this.scanning() && (status === 'done' || status === 'error')) {
        this.scanning.set(false);
        this.step.set(2);
      }
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('melodia_onboarded')) {
      void this.router.navigate(['/tabs/home'], { replaceUrl: true });
    }
  }

  next(): void {
    this.step.set((this.step() + 1) as IntroStep);
  }

  async scanMusic(): Promise<void> {
    this.permissionDenied.set(false);
    const granted = await this.libraryBridge.requestPermissions();
    if (!granted) {
      this.permissionDenied.set(true);
      return;
    }
    this.scanning.set(true);
    // Full scan; onScanComplete in bridge loads data when done
    await this.libraryBridge.startScan(false);
  }

  skip(): void {
    this.step.set(2);
  }

  finish(): void {
    localStorage.setItem('melodia_onboarded', '1');
    void this.router.navigate(['/tabs/home'], { replaceUrl: true });
  }
}
