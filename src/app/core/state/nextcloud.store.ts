import { computed, Injectable, signal } from '@angular/core';
import type { NextcloudConnectionStatus, NextcloudCredentials, NextcloudNode } from '../models/nextcloud.model';
import type { Download } from '../models/download.model';

@Injectable({ providedIn: 'root' })
export class NextcloudStore {
  private readonly _connectionStatus = signal<NextcloudConnectionStatus>('disconnected');
  private readonly _credentials      = signal<NextcloudCredentials | null>(null);
  private readonly _currentPath      = signal<string>('/');
  private readonly _nodes            = signal<readonly NextcloudNode[]>([]);
  private readonly _isLoading        = signal<boolean>(false);
  private readonly _downloads        = signal<readonly Download[]>([]);
  private readonly _syncError        = signal<string | null>(null);
  private readonly _lastSyncAt       = signal<number | null>(null);

  readonly connectionStatus = this._connectionStatus.asReadonly();
  readonly credentials      = this._credentials.asReadonly();
  readonly currentPath      = this._currentPath.asReadonly();
  readonly nodes            = this._nodes.asReadonly();
  readonly isLoading        = this._isLoading.asReadonly();
  readonly downloads        = this._downloads.asReadonly();
  readonly syncError        = this._syncError.asReadonly();
  readonly lastSyncAt       = this._lastSyncAt.asReadonly();

  readonly isConnected     = computed(() => this._connectionStatus() === 'connected');
  readonly isAuthError     = computed(() => this._connectionStatus() === 'auth_error');
  readonly hasCredentials  = computed(() => this._credentials() !== null);
  readonly activeDownloads = computed(() =>
    this._downloads().filter(d => d.status === 'downloading'),
  );
  readonly queuedDownloads = computed(() =>
    this._downloads().filter(d => d.status === 'queued'),
  );
  readonly audioNodes      = computed(() =>
    this._nodes().filter(n => !n.isDir && n.isAudio),
  );
  readonly directoryNodes  = computed(() =>
    this._nodes().filter(n => n.isDir),
  );

  setConnectionStatus(status: NextcloudConnectionStatus): void {
    this._connectionStatus.set(status);
  }

  setCredentials(creds: NextcloudCredentials | null): void {
    this._credentials.set(creds);
  }

  setCurrentPath(path: string): void {
    this._currentPath.set(path);
  }

  setNodes(nodes: readonly NextcloudNode[]): void {
    this._nodes.set(nodes);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setDownloads(downloads: readonly Download[]): void {
    this._downloads.set(downloads);
  }

  updateDownload(id: number, changes: Partial<Download>): void {
    this._downloads.update(list =>
      list.map(d => (d.id === id ? { ...d, ...changes } : d)),
    );
  }

  setSyncError(error: string | null): void {
    this._syncError.set(error);
  }

  setLastSyncAt(ts: number): void {
    this._lastSyncAt.set(ts);
    this._syncError.set(null);
  }

  navigateUp(): string {
    const parts = this._currentPath().split('/').filter(Boolean);
    parts.pop();
    const parent = '/' + parts.join('/');
    this._currentPath.set(parent || '/');
    return this._currentPath();
  }
}
