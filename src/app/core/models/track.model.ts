export type TrackSource = 'local' | 'nextcloud' | 'cached';
export type AudioFormat = 'mp3' | 'flac' | 'wav' | 'm4a' | 'aac' | 'ogg' | 'opus' | string;

export interface Track {
  readonly id: number;
  readonly source: TrackSource;
  readonly uri: string;
  readonly title: string;
  readonly artist: string;
  readonly artistId: number | null;
  readonly album: string;
  readonly albumId: number | null;
  readonly durationMs: number;
  readonly sizeBytes: number | null;
  readonly bitrate: number | null;
  readonly sampleRate: number | null;
  readonly format: AudioFormat | null;
  readonly genre: string | null;
  readonly trackNum: number | null;
  readonly discNum: number | null;
  readonly year: number | null;
  readonly artworkUri: string | null;
  readonly folderPath: string | null;
  readonly dateAdded: number;
  readonly dateModified: number | null;
  readonly playCount: number;
  readonly lastPlayed: number | null;
  readonly isHidden: boolean;
}

export interface TrackWithCounts extends Track {
  readonly albumTrackCount: number;
  readonly artistTrackCount: number;
}

export function trackDisplayTitle(track: Track): string {
  return track.title || uriBasename(track.uri);
}

function uriBasename(uri: string): string {
  const parts = uri.split('/');
  const filename = parts[parts.length - 1] ?? '';
  return filename.replace(/\.[^.]+$/, '');
}
