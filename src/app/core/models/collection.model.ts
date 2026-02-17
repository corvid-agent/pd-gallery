export interface FavoriteItem {
  artworkId: number;
  addedAt: number;
}

export interface ViewHistory {
  artworkId: number;
  viewedAt: number;
}

export interface Curation {
  id: string;
  name: string;
  artworkIds: number[];
  createdAt: number;
}

export interface UserCollection {
  favorites: FavoriteItem[];
  viewHistory: ViewHistory[];
  curations: Curation[];
}
