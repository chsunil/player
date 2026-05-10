export interface NextcloudCredentials {
  readonly serverUrl: string;
  readonly username: string;
  readonly appPassword: string;
}

export interface NextcloudNode {
  readonly path: string;
  readonly name: string;
  readonly isDir: boolean;
  readonly size: number | null;
  readonly etag: string | null;
  readonly lastModified: string | null;
  readonly contentType: string | null;
  readonly isAudio: boolean;
}

export type NextcloudConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'auth_error'
  | 'network_error';
