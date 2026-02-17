import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CollectionService } from './collection.service';

describe('CollectionService', () => {
  let service: CollectionService;
  let mockStore: Record<string, string>;

  beforeEach(() => {
    mockStore = {};
    const mockStorage: Storage = {
      length: 0,
      clear: () => { mockStore = {}; },
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      key: () => null,
    };
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true, configurable: true });

    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionService);
    service['favorites'].set([]);
    service['viewHistory'].set([]);
    service['curations'].set([]);
  });

  it('should add favorite', () => {
    service.addFavorite(100);
    expect(service.favorites().length).toBe(1);
    expect(service.isFavorite(100)).toBe(true);
  });

  it('should not duplicate favorites', () => {
    service.addFavorite(100);
    service.addFavorite(100);
    expect(service.favorites().length).toBe(1);
  });

  it('should remove favorite', () => {
    service.addFavorite(100);
    service.removeFavorite(100);
    expect(service.favorites().length).toBe(0);
    expect(service.isFavorite(100)).toBe(false);
  });

  it('should toggle favorite on', () => {
    service.toggleFavorite(100);
    expect(service.isFavorite(100)).toBe(true);
  });

  it('should toggle favorite off', () => {
    service.toggleFavorite(100);
    service.toggleFavorite(100);
    expect(service.isFavorite(100)).toBe(false);
  });

  it('should add to view history', () => {
    service.addToHistory(100);
    expect(service.viewHistory().length).toBe(1);
    expect(service.viewHistory()[0].artworkId).toBe(100);
  });

  it('should move re-viewed artwork to top of history', () => {
    service.addToHistory(100);
    service.addToHistory(200);
    service.addToHistory(100);
    expect(service.viewHistory().length).toBe(2);
    expect(service.viewHistory()[0].artworkId).toBe(100);
  });

  it('should limit history to 50 items', () => {
    for (let i = 0; i < 55; i++) {
      service.addToHistory(i);
    }
    expect(service.viewHistory().length).toBe(50);
  });

  it('should create curation', () => {
    const curation = service.createCuration('Test Curation');
    expect(curation.name).toBe('Test Curation');
    expect(curation.artworkIds).toEqual([]);
    expect(service.curations().length).toBe(1);
  });

  it('should rename curation', () => {
    const curation = service.createCuration('Old Name');
    service.renameCuration(curation.id, 'New Name');
    expect(service.curations()[0].name).toBe('New Name');
  });

  it('should delete curation', () => {
    const curation = service.createCuration('To Delete');
    service.deleteCuration(curation.id);
    expect(service.curations().length).toBe(0);
  });

  it('should add artwork to curation', () => {
    const curation = service.createCuration('My List');
    service.addToCuration(curation.id, 100);
    expect(service.curations()[0].artworkIds).toEqual([100]);
  });

  it('should not duplicate artwork in curation', () => {
    const curation = service.createCuration('My List');
    service.addToCuration(curation.id, 100);
    service.addToCuration(curation.id, 100);
    expect(service.curations()[0].artworkIds).toEqual([100]);
  });

  it('should remove artwork from curation', () => {
    const curation = service.createCuration('My List');
    service.addToCuration(curation.id, 100);
    service.addToCuration(curation.id, 200);
    service.removeFromCuration(curation.id, 100);
    expect(service.curations()[0].artworkIds).toEqual([200]);
  });

  it('should compute favoriteIds', () => {
    service.addFavorite(10);
    service.addFavorite(20);
    expect(service.favoriteIds().has(10)).toBe(true);
    expect(service.favoriteIds().has(20)).toBe(true);
    expect(service.favoriteIds().has(30)).toBe(false);
  });

  it('should compute recentlyViewedIds', () => {
    service.addToHistory(10);
    service.addToHistory(20);
    expect(service.recentlyViewedIds()).toEqual([20, 10]);
  });

  it('should persist state on mutation', () => {
    service.addFavorite(100);
    const raw = mockStore['pd-gallery-collection'];
    expect(raw).toBeDefined();
    const stored = JSON.parse(raw);
    expect(stored.favorites.length).toBe(1);
    expect(stored.favorites[0].artworkId).toBe(100);
  });

  it('should load from localStorage', () => {
    mockStore['pd-gallery-collection'] = JSON.stringify({
      favorites: [{ artworkId: 10, addedAt: 1000 }],
      viewHistory: [{ artworkId: 20, viewedAt: 2000 }],
      curations: [],
    });
    service['loadFromStorage']();
    expect(service.isFavorite(10)).toBe(true);
    expect(service.viewHistory()[0].artworkId).toBe(20);
  });
});
