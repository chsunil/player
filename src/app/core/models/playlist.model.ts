import type { Track } from './track.model';

export interface Playlist {
  readonly id: number;
  readonly name: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly artworkUri: string | null;
  readonly trackCount: number;
  readonly sortOrder: number;
}

export interface PlaylistWithTracks extends Playlist {
  readonly tracks: readonly Track[];
}
