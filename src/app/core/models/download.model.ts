export type DownloadStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';

export interface Download {
  readonly id: number;
  readonly trackId: number | null;
  readonly remoteUri: string;
  readonly localPath: string | null;
  readonly status: DownloadStatus;
  readonly progress: number;
  readonly bytesDownloaded: number;
  readonly totalBytes: number | null;
  readonly workerId: string | null;
  readonly createdAt: number;
  readonly completedAt: number | null;
  readonly errorMessage: string | null;
  readonly retryCount: number;
}

export interface DownloadProgress {
  readonly id: number;
  readonly bytesDownloaded: number;
  readonly totalBytes: number;
  readonly progress: number;
}
