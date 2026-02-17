import { Injectable, signal, computed } from '@angular/core';
import type { FavoriteItem, ViewHistory, Curation, UserCollection } from '../models/collection.model';

const STORAGE_KEY = 'pd-gallery-collection';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  readonly favorites = signal<FavoriteItem[]>([]);
  readonly viewHistory = signal<ViewHistory[]>([]);
  readonly curations = signal<Curation[]>([]);

  readonly favoriteIds = computed(() => new Set(this.favorites().map((f) => f.artworkId)));
  readonly recentlyViewedIds = computed(() => this.viewHistory().map((v) => v.artworkId));

  constructor() {
    this.loadFromStorage();
  }

  addFavorite(artworkId: number): void {
    if (this.favoriteIds().has(artworkId)) return;
    this.favorites.update((list) => [...list, { artworkId, addedAt: Date.now() }]);
    this.save();
  }

  removeFavorite(artworkId: number): void {
    this.favorites.update((list) => list.filter((f) => f.artworkId !== artworkId));
    this.save();
  }

  toggleFavorite(artworkId: number): void {
    if (this.favoriteIds().has(artworkId)) {
      this.removeFavorite(artworkId);
    } else {
      this.addFavorite(artworkId);
    }
  }

  isFavorite(artworkId: number): boolean {
    return this.favoriteIds().has(artworkId);
  }

  addToHistory(artworkId: number): void {
    this.viewHistory.update((list) => {
      const filtered = list.filter((v) => v.artworkId !== artworkId);
      return [{ artworkId, viewedAt: Date.now() }, ...filtered].slice(0, 50);
    });
    this.save();
  }

  createCuration(name: string): Curation {
    const curation: Curation = { id: crypto.randomUUID(), name, artworkIds: [], createdAt: Date.now() };
    this.curations.update((list) => [...list, curation]);
    this.save();
    return curation;
  }

  renameCuration(id: string, name: string): void {
    this.curations.update((list) => list.map((c) => (c.id === id ? { ...c, name } : c)));
    this.save();
  }

  deleteCuration(id: string): void {
    this.curations.update((list) => list.filter((c) => c.id !== id));
    this.save();
  }

  addToCuration(curationId: string, artworkId: number): void {
    this.curations.update((list) =>
      list.map((c) =>
        c.id === curationId && !c.artworkIds.includes(artworkId)
          ? { ...c, artworkIds: [...c.artworkIds, artworkId] }
          : c
      )
    );
    this.save();
  }

  removeFromCuration(curationId: string, artworkId: number): void {
    this.curations.update((list) =>
      list.map((c) =>
        c.id === curationId
          ? { ...c, artworkIds: c.artworkIds.filter((id) => id !== artworkId) }
          : c
      )
    );
    this.save();
  }

  private save(): void {
    const collection: UserCollection = {
      favorites: this.favorites(),
      viewHistory: this.viewHistory(),
      curations: this.curations(),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(collection)); } catch { /* noop */ }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const collection: UserCollection = JSON.parse(raw);
        this.favorites.set(collection.favorites ?? []);
        this.viewHistory.set(collection.viewHistory ?? []);
        this.curations.set(collection.curations ?? []);
      }
    } catch { /* noop */ }
  }
}
