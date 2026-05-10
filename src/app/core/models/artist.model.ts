export interface Artist {
  readonly id: number;
  readonly name: string;
  readonly artworkUri: string | null;
  readonly albumCount: number;
  readonly trackCount: number;
}
