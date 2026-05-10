import type { TrackSource } from './track.model';

export interface QueueItem {
  readonly queueId: string;
  readonly trackId: number;
  readonly source: TrackSource;
  readonly uri: string;
  readonly title: string;
  readonly artist: string;
  readonly album: string;
  readonly artworkUri: string | null;
  readonly durationMs: number;
  readonly uriOverride?: string;
}

export type RepeatMode = 'none' | 'one' | 'all';

export interface QueueState {
  readonly items: readonly QueueItem[];
  readonly currentIndex: number;
  readonly shuffle: boolean;
  readonly repeat: RepeatMode;
}

export function queueItemFromBridge(data: Record<string, unknown>): QueueItem {
  return {
    queueId:    String(data['queueId'] ?? ''),
    trackId:    Number(data['trackId'] ?? 0),
    source:     (data['source'] as TrackSource) ?? 'local',
    uri:        String(data['uri'] ?? ''),
    title:      String(data['title'] ?? ''),
    artist:     String(data['artist'] ?? ''),
    album:      String(data['album'] ?? ''),
    artworkUri: data['artworkUri'] ? String(data['artworkUri']) : null,
    durationMs: Number(data['durationMs'] ?? 0),
  };
}
