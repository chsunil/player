export interface Album {
  readonly id: number;
  readonly title: string;
  readonly artistId: number | null;
  readonly artist: string;
  readonly year: number | null;
  readonly artworkUri: string | null;
  readonly trackCount: number;
}
